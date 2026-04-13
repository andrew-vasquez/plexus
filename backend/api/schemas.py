from __future__ import annotations

from pydantic import BaseModel, Field


class NoteEventResponse(BaseModel):
    start_s: float
    end_s: float
    pitch_midi: int
    amplitude: float
    string_number: int | None = None
    fret: int | None = None


class ArtifactResponse(BaseModel):
    artifact_id: str
    filename: str
    content_type: str
    download_url: str


class TranscriptionArtifactsResponse(BaseModel):
    midi: ArtifactResponse | None = None
    gp5: ArtifactResponse | None = None


class TranscriptionResponse(BaseModel):
    job_id: str
    source_filename: str
    content_type: str
    bpm: float = Field(default=120.0)
    tuning: str
    capo: int
    mode: str
    time_signature: str
    note_count: int
    note_preview_count: int
    note_events: list[NoteEventResponse]
    artifacts: TranscriptionArtifactsResponse


class TranscriptionJobQueuedResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    message: str


class TranscriptionJobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    message: str
    error: str | None = None
    result: TranscriptionResponse | None = None
