from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from api.schemas import (
    ArtifactResponse,
    NoteEventResponse,
    TranscriptionArtifactsResponse,
    TranscriptionJobQueuedResponse,
    TranscriptionJobStatusResponse,
    TranscriptionResponse,
)
from services.note_processing import TranscriptionOptions, parse_time_signature
from services.jobs import job_store
from services.pipeline import run_transcription_pipeline_payload
from services.storage import artifact_store

router = APIRouter()


def _map_transcription_response(payload: dict[str, object]) -> TranscriptionResponse:
    artifacts = payload["artifacts"]
    midi_artifact = ArtifactResponse(**artifacts["midi"]) if artifacts["midi"] else None
    gp5_artifact = ArtifactResponse(**artifacts["gp5"]) if artifacts["gp5"] else None
    stem_artifact = ArtifactResponse(**artifacts["stem"]) if artifacts["stem"] else None

    return TranscriptionResponse(
        job_id=str(payload["job_id"]),
        source_filename=str(payload["source_filename"]),
        content_type=str(payload["content_type"]),
        bpm=float(payload["bpm"]),
        tuning=str(payload["tuning"]),
        capo=int(payload["capo"]),
        mode=str(payload["mode"]),
        stem_mode=str(payload.get("stem_mode", "none")),
        time_signature=str(payload["time_signature"]),
        note_count=int(payload["note_count"]),
        note_preview_count=len(payload["note_events"]),
        note_events=[NoteEventResponse(**note) for note in payload["note_events"]],
        artifacts=TranscriptionArtifactsResponse(
            midi=midi_artifact,
            gp5=gp5_artifact,
            stem=stem_artifact,
        ),
    )


def _run_job(
    job_id: str,
    *,
    payload: bytes,
    filename: str,
    content_type: str,
    options: TranscriptionOptions,
    include_gp5: bool,
    stem_mode: str,
) -> None:
    try:
        result = run_transcription_pipeline_payload(
            payload=payload,
            filename=filename,
            content_type=content_type,
            options=options,
            include_gp5=include_gp5,
            stem_mode=stem_mode,
            job_id=job_id,
            progress_callback=lambda status, progress, message: job_store.update(
                job_id,
                status=status,
                progress=progress,
                message=message,
            ),
        )
        job_store.update(
            job_id,
            status="done",
            progress=100,
            message="Artifacts ready for download",
            result=result,
        )
    except HTTPException as exc:
        job_store.update(
            job_id,
            status="failed",
            progress=100,
            message="Transcription failed",
            error=str(exc.detail),
        )
    except Exception as exc:
        job_store.update(
            job_id,
            status="failed",
            progress=100,
            message="Transcription failed",
            error=str(exc),
        )


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "plexus"}


def _build_transcription_options(
    bpm: float | None,
    tuning: str,
    capo: int,
    mode: str,
    time_signature: str,
) -> TranscriptionOptions:
    try:
        numerator, denominator = parse_time_signature(time_signature)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if tuning not in {"standard", "drop_d", "half_step_down"}:
        raise HTTPException(status_code=400, detail="Unsupported tuning preset")
    if mode not in {"riff", "lead", "rhythm"}:
        raise HTTPException(status_code=400, detail="Unsupported transcription mode")
    if capo < 0 or capo > 12:
        raise HTTPException(status_code=400, detail="Capo must be between 0 and 12")
    if bpm is not None and not 40 <= bpm <= 260:
        raise HTTPException(status_code=400, detail="BPM must be between 40 and 260")

    return TranscriptionOptions(
        bpm=bpm,
        tuning=tuning,
        capo=capo,
        mode=mode,
        time_signature_numerator=numerator,
        time_signature_denominator=denominator,
    )


def _validate_stem_mode(stem_mode: str) -> str:
    if stem_mode not in {"none", "guitar_only", "no_guitar"}:
        raise HTTPException(status_code=400, detail="Unsupported stem separation mode")
    return stem_mode


@router.post("/transcribe", response_model=TranscriptionJobQueuedResponse)
async def transcribe(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bpm: float | None = Form(None),
    tuning: str = Form("standard"),
    capo: int = Form(0),
    mode: str = Form("riff"),
    time_signature: str = Form("4/4"),
    stem_mode: str = Form("none"),
) -> TranscriptionJobQueuedResponse:
    options = _build_transcription_options(bpm, tuning, capo, mode, time_signature)
    stem_mode = _validate_stem_mode(stem_mode)
    payload = await file.read()
    job = job_store.create(message="Upload received")
    background_tasks.add_task(
        _run_job,
        job.job_id,
        payload=payload,
        filename=file.filename or "upload.mp3",
        content_type=file.content_type or "application/octet-stream",
        options=options,
        include_gp5=True,
        stem_mode=stem_mode,
    )
    return TranscriptionJobQueuedResponse(
        job_id=job.job_id,
        status=job.status,
        progress=job.progress,
        message=job.message,
    )


@router.post("/transcribe/midi", response_model=TranscriptionJobQueuedResponse)
async def transcribe_midi(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bpm: float | None = Form(None),
    tuning: str = Form("standard"),
    capo: int = Form(0),
    mode: str = Form("riff"),
    time_signature: str = Form("4/4"),
    stem_mode: str = Form("none"),
) -> TranscriptionJobQueuedResponse:
    options = _build_transcription_options(bpm, tuning, capo, mode, time_signature)
    stem_mode = _validate_stem_mode(stem_mode)
    payload = await file.read()
    job = job_store.create(message="Upload received")
    background_tasks.add_task(
        _run_job,
        job.job_id,
        payload=payload,
        filename=file.filename or "upload.mp3",
        content_type=file.content_type or "application/octet-stream",
        options=options,
        include_gp5=False,
        stem_mode=stem_mode,
    )
    return TranscriptionJobQueuedResponse(
        job_id=job.job_id,
        status=job.status,
        progress=job.progress,
        message=job.message,
    )


@router.get(
    "/transcribe/{job_id}/status", response_model=TranscriptionJobStatusResponse
)
async def transcription_status(job_id: str) -> TranscriptionJobStatusResponse:
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return TranscriptionJobStatusResponse(
        job_id=job.job_id,
        status=job.status,
        progress=job.progress,
        message=job.message,
        error=job.error,
        result=_map_transcription_response(job.result) if job.result else None,
    )


@router.get("/artifacts/{artifact_id}")
async def download_artifact(artifact_id: str) -> FileResponse:
    artifact_path = artifact_store.resolve(artifact_id)
    content_type = (
        mimetypes.guess_type(artifact_path.name)[0] or "application/octet-stream"
    )
    return FileResponse(
        path=artifact_path,
        media_type=content_type,
        filename=Path(artifact_path).name,
    )
