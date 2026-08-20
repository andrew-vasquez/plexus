"""Persists generated artifacts (MIDI, GP5, stems) for download.

Every export from the pipeline is saved to the artifact directory and can
be fetched later by its ``artifact_id``. Files are stored on disk with
their id as the filename — no database needed for the MVP.
"""

from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import HTTPException

from core.config import settings


class ArtifactStore:
    """Read/write access to the artifact directory."""

    def __init__(self, artifact_dir: Path) -> None:
        self.artifact_dir = artifact_dir

    def save_bytes(self, filename: str, payload: bytes) -> tuple[str, Path, str]:
        """Store a file and return ``(artifact_id, path, content_type)``."""
        artifact_id = filename
        artifact_path = self.artifact_dir / artifact_id
        artifact_path.write_bytes(payload)
        content_type = mimetypes.guess_type(artifact_path.name)[0] or "application/octet-stream"
        return artifact_id, artifact_path, content_type

    def resolve(self, artifact_id: str) -> Path:
        """Return the path for an artifact id.

        Guards against path traversal: the resolved path must live inside
        the artifact directory. Raises 404 if the file doesn't exist.

        Raises:
            HTTPException: 404 if the artifact is missing or outside the dir.
        """
        candidate = (self.artifact_dir / artifact_id).resolve()
        artifact_root = self.artifact_dir.resolve()

        if artifact_root not in candidate.parents and candidate != artifact_root:
            raise HTTPException(status_code=404, detail="Artifact not found")

        if not candidate.exists() or not candidate.is_file():
            raise HTTPException(status_code=404, detail="Artifact not found")

        return candidate


artifact_store = ArtifactStore(settings.artifact_dir)
