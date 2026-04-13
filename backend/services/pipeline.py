from __future__ import annotations

import shutil
import uuid
from pathlib import Path
from typing import Callable

from fastapi import HTTPException, UploadFile

from core.config import settings
from services.gp_export import build_gp5
from services.inference import get_inference_provider
from services.note_processing import (
    TranscriptionOptions,
    assign_fretboard_positions,
    clean_note_events,
    detect_bpm_from_stem,
    note_preview,
    quantize_note_events,
    resolve_tuning_map,
    write_midi_from_note_events,
)
from services.refinement import RefinementContext, get_refinement_provider
from services.storage import artifact_store


ALLOWED_AUDIO_TYPES = {
    "audio/flac",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
}
ALLOWED_AUDIO_EXTENSIONS = {".flac", ".mp3", ".wav"}


def _validate_upload(file: UploadFile, payload: bytes) -> str:
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
    upload_path = settings.upload_dir / f"{job_id}_{Path(filename).name}"
    upload_path.write_bytes(payload)
    return upload_path


def _workspace(job_id: str) -> Path:
    workspace = settings.work_dir / job_id
    if workspace.exists():
        shutil.rmtree(workspace)
    workspace.mkdir(parents=True, exist_ok=True)
    return workspace


def _build_artifact_payload(
    job_id: str, source_stem: str, extension: str, payload: bytes
) -> dict[str, str]:
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
) -> dict[str, str] | None:
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

    try:
        import librosa
        import numpy as np
        import soundfile as sf
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="Stem separation dependencies are not installed",
        ) from exc

    try:
        source_audio, sample_rate = librosa.load(str(source_path), sr=None, mono=False)
        guitar_audio, _ = librosa.load(
            str(guitar_stem_path), sr=sample_rate, mono=False
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load audio for no-guitar export: {exc}",
        ) from exc

    if getattr(source_audio, "ndim", 1) == 1:
        source_audio = np.expand_dims(source_audio, axis=0)
    if getattr(guitar_audio, "ndim", 1) == 1:
        guitar_audio = np.expand_dims(guitar_audio, axis=0)

    if source_audio.shape[0] != guitar_audio.shape[0]:
        if source_audio.shape[0] == 1:
            source_audio = np.repeat(source_audio, guitar_audio.shape[0], axis=0)
        elif guitar_audio.shape[0] == 1:
            guitar_audio = np.repeat(guitar_audio, source_audio.shape[0], axis=0)
        else:
            min_channels = min(source_audio.shape[0], guitar_audio.shape[0])
            source_audio = source_audio[:min_channels]
            guitar_audio = guitar_audio[:min_channels]

    min_samples = min(source_audio.shape[-1], guitar_audio.shape[-1])
    residual = source_audio[..., :min_samples] - guitar_audio[..., :min_samples]
    peak = float(np.max(np.abs(residual))) if residual.size else 0.0
    if peak > 0:
        residual = residual / peak * 0.95

    residual_path = workspace / f"{source_stem}_no_guitar.wav"
    output_audio = residual[0] if residual.shape[0] == 1 else residual.T

    try:
        sf.write(
            str(residual_path), output_audio.astype(np.float32, copy=False), sample_rate
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write no-guitar export: {exc}",
        ) from exc

    return _build_artifact_payload(
        job_id,
        f"{source_stem}_no_guitar",
        ".wav",
        residual_path.read_bytes(),
    )


ProgressCallback = Callable[[str, int, str], None]


def _noop_progress(_status: str, _progress: int, _message: str) -> None:
    return


async def run_transcription_pipeline(
    file: UploadFile,
    options: TranscriptionOptions,
    include_gp5: bool = True,
) -> dict[str, object]:
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
) -> dict[str, object]:
    progress = progress_callback or _noop_progress
    resolved_job_id = job_id or uuid.uuid4().hex[:12]
    source_path = _persist_upload(resolved_job_id, filename, payload)
    workspace = _workspace(resolved_job_id)
    provider = get_inference_provider()

    try:
        progress("isolating", 15, "Isolating the guitar stem")
        guitar_stem_path = provider.isolate_guitar(source_path, workspace)
        progress("transcribing", 45, "Transcribing the isolated guitar")
        transcription = provider.transcribe_guitar(guitar_stem_path)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    raw_note_events = transcription["note_events"]
    tuning_map = resolve_tuning_map(options.tuning, options.capo)
    bpm = options.bpm or detect_bpm_from_stem(guitar_stem_path)
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
    progress("post_processing", 70, "Cleaning note events and mapping the fretboard")
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

    source_stem = Path(filename).stem
    stem_artifact = None
    if stem_mode != "none":
        progress("separating", 82, "Preparing stem separation export")
        stem_artifact = _build_requested_stem_artifact(
            job_id=resolved_job_id,
            stem_mode=stem_mode,
            source_path=source_path,
            source_stem=source_stem,
            guitar_stem_path=guitar_stem_path,
            workspace=workspace,
        )

    progress("exporting", 88, "Exporting MIDI and Guitar Pro artifacts")
    midi_path = write_midi_from_note_events(
        tabbed_note_events,
        workspace / f"{source_stem}.mid",
    )
    artifacts: dict[str, dict[str, str] | None] = {
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

    progress("done", 100, "Artifacts ready for download")

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
