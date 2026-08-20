"""The transcription pipeline: audio in, MIDI + Guitar Pro out.

This is the orchestrator. It runs the whole job as a sequence of steps
and reports progress along the way:

1. Save the uploaded audio into the job workspace
2. Isolate the guitar stem (Demucs via the inference provider)
3. Transcribe the stem into raw note events (Basic Pitch)
4. Optional AI refinement hook (see ``services.refinement``)
5. Clean, quantize, and map notes to the fretboard
6. Optionally build a "song without guitar" stem artifact
7. Export MIDI and Guitar Pro files as downloadable artifacts

The heavy lifting lives in ``services.audio`` (stem work) and
``services.notes`` (note math); this module only sequences it.
"""

from __future__ import annotations

import shutil
import uuid
from pathlib import Path
from typing import Callable, TypedDict

from fastapi import HTTPException, UploadFile

from core.config import settings
from services.audio.enhancement import subtract_guitar_from_source
from services.gp_export import build_gp5
from services.inference import get_inference_provider
from services.notes.cleaning import clean_note_events
from services.notes.fretboard import assign_fretboard_positions
from services.notes.midi import note_preview, write_midi_from_note_events
from services.notes.options import (
    TranscriptionOptions,
    resolve_tuning_map,
)
from services.notes.quantization import quantize_note_events
from services.notes.types import TabbedNoteEvent
from services.audio.tempo import detect_bpm_from_stem
from services.refinement import RefinementContext, get_refinement_provider
from services.storage import artifact_store


class ArtifactPayload(TypedDict):
    """Metadata describing one downloadable artifact."""

    artifact_id: str
    filename: str
    content_type: str
    download_url: str


class TranscriptionArtifacts(TypedDict):
    """Downloadable files produced by a finished job."""

    midi: ArtifactPayload
    gp5: ArtifactPayload | None
    stem: ArtifactPayload | None


class TranscriptionResult(TypedDict):
    """The shape of a finished job's result payload."""

    job_id: str
    source_filename: str
    content_type: str
    bpm: float
    tuning: str
    capo: int
    mode: str
    stem_mode: str
    time_signature: str
    note_count: int
    note_events: list[TabbedNoteEvent]
    artifacts: TranscriptionArtifacts


ALLOWED_AUDIO_TYPES = {
    "audio/flac",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
}
ALLOWED_AUDIO_EXTENSIONS = {".flac", ".mp3", ".wav"}

ProgressCallback = Callable[[str, int, str], None]

# Names of the transcription stages, used in job status messages.
STATUS_ISOLATING = "isolating"
STATUS_TRANSCRIBING = "transcribing"
STATUS_POST_PROCESSING = "post_processing"
STATUS_SEPARATING = "separating"
STATUS_EXPORTING = "exporting"
STATUS_DONE = "done"


# ---------------------------------------------------------------------------
# Upload / workspace helpers
# ---------------------------------------------------------------------------


def _validate_upload(file: UploadFile, payload: bytes) -> str:
    """Check the file has content, a sane size, and an audio extension."""
    filename = file.filename or "upload.mp3"
    extension = Path(filename).suffix.lower()
    content_type = (file.content_type or "").lower()

    if not payload:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    if len(payload) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({settings.max_upload_mb}MB max for MVP)",
        )

    if (
        extension not in ALLOWED_AUDIO_EXTENSIONS
        and content_type not in ALLOWED_AUDIO_TYPES
    ):
        raise HTTPException(status_code=400, detail="Unsupported audio file type")

    return filename


def _persist_upload(job_id: str, filename: str, payload: bytes) -> Path:
    """Save the uploaded file into the uploads directory."""
    upload_path = settings.upload_dir / f"{job_id}_{Path(filename).name}"
    upload_path.write_bytes(payload)
    return upload_path


def _workspace(job_id: str) -> Path:
    """Return a fresh scratch directory for one job's intermediate files."""
    workspace = settings.work_dir / job_id
    if workspace.exists():
        shutil.rmtree(workspace)
    workspace.mkdir(parents=True, exist_ok=True)
    return workspace


def _noop_progress(_status: str, _progress: int, _message: str) -> None:
    return


# ---------------------------------------------------------------------------
# Artifact helpers
# ---------------------------------------------------------------------------


def _build_artifact_payload(
    job_id: str, source_stem: str, extension: str, payload: bytes
) -> ArtifactPayload:
    """Store a file as an artifact and describe how to download it."""
    artifact_filename = f"{job_id}_{source_stem}{extension}"
    artifact_id, artifact_path, content_type = artifact_store.save_bytes(
        artifact_filename, payload
    )
    return {
        "artifact_id": artifact_id,
        "filename": artifact_path.name,
        "content_type": content_type,
        "download_url": f"/api/v1/artifacts/{artifact_id}",
    }


def _build_requested_stem_artifact(
    *,
    job_id: str,
    stem_mode: str,
    source_path: Path,
    source_stem: str,
    guitar_stem_path: Path,
    workspace: Path,
) -> ArtifactPayload | None:
    """Build the stem-separation artifact the user asked for.

    ``stem_mode`` values:
    - ``"none"``        -> no stem artifact
    - ``"guitar_only"`` -> the isolated guitar, as-is
    - ``"no_guitar"``   -> the original song minus the guitar
    """
    if stem_mode == "none":
        return None

    if stem_mode == "guitar_only":
        return _build_artifact_payload(
            job_id,
            f"{source_stem}_guitar_only",
            ".wav",
            guitar_stem_path.read_bytes(),
        )

    if stem_mode != "no_guitar":
        raise HTTPException(status_code=400, detail="Unsupported stem separation mode")

    residual_path = workspace / f"{source_stem}_no_guitar.wav"
    try:
        subtract_guitar_from_source(
            source_path=source_path,
            guitar_stem_path=guitar_stem_path,
            output_path=residual_path,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return _build_artifact_payload(
        job_id,
        f"{source_stem}_no_guitar",
        ".wav",
        residual_path.read_bytes(),
    )


# ---------------------------------------------------------------------------
# Public entry points
# ---------------------------------------------------------------------------


async def run_transcription_pipeline(
    file: UploadFile,
    options: TranscriptionOptions,
    include_gp5: bool = True,
) -> TranscriptionResult:
    """Async wrapper around the pipeline for an uploaded file."""
    payload = await file.read()
    filename = _validate_upload(file, payload)
    return run_transcription_pipeline_payload(
        payload=payload,
        filename=filename,
        content_type=file.content_type or "application/octet-stream",
        options=options,
        include_gp5=include_gp5,
    )


def run_transcription_pipeline_payload(
    payload: bytes,
    filename: str,
    content_type: str,
    options: TranscriptionOptions,
    include_gp5: bool = True,
    stem_mode: str = "none",
    *,
    job_id: str | None = None,
    progress_callback: ProgressCallback | None = None,
) -> TranscriptionResult:
    """Run the full transcription pipeline and return the result payload.

    Args:
        payload: raw uploaded audio bytes.
        filename: original file name (used for extensions/stems).
        content_type: MIME type of the upload.
        options: tuning, tempo, mode, and time signature for this job.
        include_gp5: also export a Guitar Pro file (in addition to MIDI).
        stem_mode: whether to additionally build a guitar/no-guitar stem.
        job_id: caller-provided job id (defaults to a fresh UUID).
        progress_callback: receives ``(status, progress, message)`` updates.

    Returns:
        A dict describing the finished job, including download artifacts.
    """
    progress = progress_callback or _noop_progress
    resolved_job_id = job_id or uuid.uuid4().hex[:12]
    source_path = _persist_upload(resolved_job_id, filename, payload)
    workspace = _workspace(resolved_job_id)
    provider = get_inference_provider()

    # --- Step 1: isolate the guitar, then transcribe it to raw notes ---
    try:
        progress(STATUS_ISOLATING, 15, "Isolating the guitar stem")
        guitar_stem_path = provider.isolate_guitar(source_path, workspace)
        progress(STATUS_TRANSCRIBING, 45, "Transcribing the isolated guitar")
        transcription = provider.transcribe_guitar(guitar_stem_path)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    raw_note_events = transcription["note_events"]
    tuning_map = resolve_tuning_map(options.tuning, options.capo)
    bpm = options.bpm or detect_bpm_from_stem(guitar_stem_path)

    # --- Step 2: optional AI refinement hook (currently a no-op) ---
    raw_note_events = get_refinement_provider().refine(
        raw_note_events,
        RefinementContext(
            job_id=resolved_job_id,
            stem_path=guitar_stem_path,
            source_filename=filename,
            bpm=bpm,
            tuning_map=tuning_map,
            options=options,
        ),
    )

    # --- Step 3: clean, quantize, and map notes to the fretboard ---
    progress(STATUS_POST_PROCESSING, 70, "Cleaning note events and mapping the fretboard")
    cleaned_note_events = clean_note_events(raw_note_events, options, tuning_map)
    quantized_note_events = quantize_note_events(cleaned_note_events, bpm, options.mode)
    tabbed_note_events = assign_fretboard_positions(
        quantized_note_events, tuning_map, options.mode
    )
    note_count = len(tabbed_note_events)

    if note_count == 0:
        raise HTTPException(
            status_code=422,
            detail="No notes detected. Try a cleaner recording or adjust thresholds.",
        )

    # --- Step 4: optional "song without guitar" stem artifact ---
    source_stem = Path(filename).stem
    stem_artifact = None
    if stem_mode != "none":
        progress(STATUS_SEPARATING, 82, "Preparing stem separation export")
        stem_artifact = _build_requested_stem_artifact(
            job_id=resolved_job_id,
            stem_mode=stem_mode,
            source_path=source_path,
            source_stem=source_stem,
            guitar_stem_path=guitar_stem_path,
            workspace=workspace,
        )

    # --- Step 5: export MIDI (and optionally Guitar Pro) artifacts ---
    progress(STATUS_EXPORTING, 88, "Exporting MIDI and Guitar Pro artifacts")
    midi_path = write_midi_from_note_events(
        tabbed_note_events,
        workspace / f"{source_stem}.mid",
    )
    artifacts: TranscriptionArtifacts = {
        "midi": _build_artifact_payload(
            resolved_job_id, source_stem, ".mid", midi_path.read_bytes()
        ),
        "gp5": None,
        "stem": stem_artifact,
    }

    if include_gp5:
        try:
            gp5_path = build_gp5(
                note_events=tabbed_note_events,
                bpm=bpm,
                tuning_map=tuning_map,
                time_signature=(
                    options.time_signature_numerator,
                    options.time_signature_denominator,
                ),
                output_path=workspace / f"{source_stem}.gp5",
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail=f"GP5 export failed: {exc}"
            ) from exc

        artifacts["gp5"] = _build_artifact_payload(
            resolved_job_id, source_stem, ".gp5", gp5_path.read_bytes()
        )

    progress(STATUS_DONE, 100, "Artifacts ready for download")

    return {
        "job_id": resolved_job_id,
        "source_filename": filename,
        "content_type": content_type,
        "bpm": bpm,
        "tuning": options.tuning,
        "capo": options.capo,
        "mode": options.mode,
        "stem_mode": stem_mode,
        "time_signature": options.time_signature,
        "note_count": note_count,
        "note_events": note_preview(tabbed_note_events),
        "artifacts": artifacts,
    }
