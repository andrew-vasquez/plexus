from __future__ import annotations

import threading
import uuid
from dataclasses import dataclass, replace


JobStatus = str


@dataclass(frozen=True)
class TranscriptionJob:
    job_id: str
    status: JobStatus
    progress: int
    message: str
    result: dict[str, object] | None = None
    error: str | None = None


class JobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, TranscriptionJob] = {}
        self._lock = threading.Lock()

    def create(self, message: str = "Queued for transcription") -> TranscriptionJob:
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
        with self._lock:
            return self._jobs.get(job_id)

    def update(
        self,
        job_id: str,
        *,
        status: JobStatus | None = None,
        progress: int | None = None,
        message: str | None = None,
        result: dict[str, object] | None = None,
        error: str | None = None,
    ) -> TranscriptionJob:
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
