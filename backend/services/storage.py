from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import HTTPException

from core.config import settings


class ArtifactStore:
    def __init__(self, artifact_dir: Path) -> None:
        self.artifact_dir = artifact_dir

    def save_bytes(self, filename: str, payload: bytes) -> tuple[str, Path, str]:
        artifact_id = filename
        artifact_path = self.artifact_dir / artifact_id
        artifact_path.write_bytes(payload)
        content_type = mimetypes.guess_type(artifact_path.name)[0] or "application/octet-stream"
        return artifact_id, artifact_path, content_type

    def resolve(self, artifact_id: str) -> Path:
        candidate = (self.artifact_dir / artifact_id).resolve()
        artifact_root = self.artifact_dir.resolve()

        if artifact_root not in candidate.parents and candidate != artifact_root:
            raise HTTPException(status_code=404, detail="Artifact not found")

        if not candidate.exists() or not candidate.is_file():
            raise HTTPException(status_code=404, detail="Artifact not found")

        return candidate


artifact_store = ArtifactStore(settings.artifact_dir)
