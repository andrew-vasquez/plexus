from __future__ import annotations

import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000"


class Settings:
    def __init__(self) -> None:
        self.app_name = os.getenv("PLEXUS_APP_NAME", "Plexus API")
        self.app_version = os.getenv("PLEXUS_APP_VERSION", "0.1.0")
        self.inference_provider = os.getenv("PLEXUS_INFERENCE_PROVIDER", "local")
        self.demucs_model = os.getenv("PLEXUS_DEMUCS_MODEL", "htdemucs_6s")
        self.guitar_stem_strategy = os.getenv("PLEXUS_GUITAR_STEM_STRATEGY", "direct")
        self.guitar_stem_recovery_blend = float(
            os.getenv("PLEXUS_GUITAR_STEM_RECOVERY_BLEND", "0.3")
        )
        self.refinement_provider = os.getenv("PLEXUS_REFINEMENT_PROVIDER", "none")
        self.refinement_dump_dir = BACKEND_DIR / "refinement_dumps"
        self.guitar_stem_highpass_hz = float(
            os.getenv("PLEXUS_GUITAR_STEM_HIGHPASS_HZ", "70")
        )
        self.guitar_stem_lowpass_hz = float(
            os.getenv("PLEXUS_GUITAR_STEM_LOWPASS_HZ", "1800")
        )
        self.guitar_stem_harmonic_margin = float(
            os.getenv("PLEXUS_GUITAR_STEM_HARMONIC_MARGIN", "3.0")
        )
        self.max_upload_mb = int(os.getenv("PLEXUS_MAX_UPLOAD_MB", "50"))
        self.allowed_origins = [
            origin.strip()
            for origin in os.getenv(
                "PLEXUS_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS
            ).split(",")
            if origin.strip()
        ]
        self.upload_dir = BACKEND_DIR / "uploads"
        self.work_dir = BACKEND_DIR / "work"
        self.artifact_dir = BACKEND_DIR / "artifacts"
        self.ensure_directories()

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    def ensure_directories(self) -> None:
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.work_dir.mkdir(parents=True, exist_ok=True)
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        self.refinement_dump_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
