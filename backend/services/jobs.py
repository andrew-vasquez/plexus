"""In-memory job tracking for async transcription requests.

A transcription runs in the background (via FastAPI ``BackgroundTasks``),
so the API needs somewhere to record each job's status and result for
polling. This store keeps that data in memory — restarting the server
loses all jobs, which is fine for the MVP.
"""

from __future__ import annotations

import threading
import uuid
from dataclasses import dataclass, replace

from services.pipeline import TranscriptionResult


JobStatus = str


@dataclass(frozen=True)
class TranscriptionJob:
    """One background transcription job and everything we know about it."""

    job_id: str
    status: JobStatus
    progress: int
    message: str
    result: TranscriptionResult | None = None
    error: str | None = None


class JobStore:
    """Thread-safe map of job id -> ``TranscriptionJob``."""

    def __init__(self) -> None:
        self._jobs: dict[str, TranscriptionJob] = {}
        self._lock = threading.Lock()

    def create(self, message: str = "Queued for transcription") -> TranscriptionJob:
        """Register a new job in the ``queued`` state and return it."""
        job = TranscriptionJob(
            job_id=uuid.uuid4().hex[:12],
            status="queued",
            progress=0,
            message=message,
        )
        with self._lock:
            self._jobs[job.job_id] = job
        return job

    def get(self, job_id: str) -> TranscriptionJob | None:
        """Look up a job, or return ``None`` if it doesn't exist."""
        with self._lock:
            return self._jobs.get(job_id)

    def update(
        self,
        job_id: str,
        *,
        status: JobStatus | None = None,
        progress: int | None = None,
        message: str | None = None,
        result: TranscriptionResult | None = None,
        error: str | None = None,
    ) -> TranscriptionJob:
        """Update any subset of a job's fields (only non-``None`` values)."""
        with self._lock:
            current = self._jobs[job_id]
            updated = replace(
                current,
                status=status if status is not None else current.status,
                progress=progress if progress is not None else current.progress,
                message=message if message is not None else current.message,
                result=result if result is not None else current.result,
                error=error if error is not None else current.error,
            )
            self._jobs[job_id] = updated
            return updated


job_store = JobStore()
