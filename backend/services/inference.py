"""Transcription providers: turn audio into raw note events.

A provider owns the two machine-learning steps of the pipeline:

1. ``isolate_guitar``   — Demucs stem separation (audio → guitar .wav)
2. ``transcribe_guitar`` — Basic Pitch pitch detection (guitar .wav → notes)

There are two implementations, selected with ``PLEXUS_INFERENCE_PROVIDER``:

- ``local`` — runs Demucs/Basic Pitch on this machine (CPU, slow but free)
- ``modal`` — runs them on Modal GPU functions (fast, needs ``modal_app``)

Both providers share the same DSP helpers from ``services.audio``.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from core.config import settings
from services.audio.demucs import run_demucs_two_stem
from services.audio.enhancement import (
    blend_recovered_harmonics,
    create_preview_guitar_stem,
    refine_guitar_stem,
)
from services.notes.types import NoteEvent


class InferenceProvider(ABC):
    """Interface every transcription backend must implement."""

    @abstractmethod
    def isolate_guitar(self, source_path: Path, workspace: Path) -> Path:
        """Separate the guitar out of ``source_path`` and return the stem."""
        raise NotImplementedError

    @abstractmethod
    def transcribe_guitar(self, guitar_stem_path: Path) -> dict[str, Any]:
        """Detect notes in a guitar stem, returning ``{"note_events": [...]}``."""
        raise NotImplementedError

    def create_preview_stem(self, guitar_stem_path: Path, workspace: Path) -> Path:
        """Build a cleaned playback preview of the stem for the UI."""
        return create_preview_guitar_stem(guitar_stem_path, workspace)


class LocalInferenceProvider(InferenceProvider):
    """Runs Demucs and Basic Pitch as local subprocesses/imports."""

    def isolate_guitar(self, source_path: Path, workspace: Path) -> Path:
        primary_stem = run_demucs_two_stem(
            source_path=source_path,
            workspace=workspace,
            stem_name="guitar",
            model_name=settings.demucs_model,
            run_name="guitar",
        )
        return _apply_stem_strategy(primary_stem, source_path, workspace)

    def transcribe_guitar(self, guitar_stem_path: Path) -> dict[str, Any]:
        try:
            from basic_pitch import ICASSP_2022_MODEL_PATH
            from basic_pitch.inference import predict
        except ImportError as exc:
            raise RuntimeError(
                "basic-pitch is not installed in the active Python environment"
            ) from exc

        _model_output, _midi_data, note_events = predict(
            str(guitar_stem_path),
            ICASSP_2022_MODEL_PATH,
            onset_threshold=0.5,
            frame_threshold=0.3,
            minimum_note_length=58,
            minimum_frequency=80,
            maximum_frequency=1200,
            multiple_pitch_bends=False,
            melodia_trick=True,
        )

        raw_notes: list[NoteEvent] = [
            {
                "start_s": float(note[0]),
                "end_s": float(note[1]),
                "pitch_midi": int(note[2]),
                "amplitude": float(note[3]),
            }
            for note in note_events
        ]
        return {
            "note_events": raw_notes,
            "note_count": len(raw_notes),
        }


class ModalInferenceProvider(InferenceProvider):
    """Runs Demucs and Basic Pitch on Modal GPU functions."""

    def isolate_guitar(self, source_path: Path, workspace: Path) -> Path:
        try:
            from modal_app.demucs_fn import separate_guitar_stem  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "Modal provider is configured but modal_app.demucs_fn is unavailable"
            ) from exc

        source_bytes = source_path.read_bytes()
        stem_bytes = separate_guitar_stem.remote(source_bytes, source_path.name)
        stem_path = workspace / "guitar.wav"
        stem_path.write_bytes(stem_bytes)
        # Note: Modal only supports the "filtered" post-processing strategy.
        if settings.guitar_stem_strategy == "filtered":
            return refine_guitar_stem(stem_path, workspace)
        return stem_path

    def transcribe_guitar(self, guitar_stem_path: Path) -> dict[str, Any]:
        try:
            from modal_app.basic_pitch_fn import transcribe_audio  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "Modal provider is configured but modal_app.basic_pitch_fn is unavailable"
            ) from exc

        result = transcribe_audio.remote(guitar_stem_path.read_bytes())
        raw_notes: list[NoteEvent] = result["note_events"]
        return {
            "note_events": raw_notes,
            "note_count": len(raw_notes),
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _apply_stem_strategy(
    primary_stem: Path, source_path: Path, workspace: Path
) -> Path:
    """Post-process a raw Demucs stem according to the configured strategy.

    ``PLEXUS_GUITAR_STEM_STRATEGY`` chooses how much cleanup to do:

    - ``direct``        — use the raw Demucs stem as-is
    - ``filtered``      — aggressive harmonic band filtering
    - ``hybrid_other``  — raw stem plus harmonics recovered from the
      Demucs ``other`` stem (falls back to the raw stem if that fails)
    """
    if settings.guitar_stem_strategy == "direct":
        return primary_stem

    if settings.guitar_stem_strategy == "filtered":
        return refine_guitar_stem(primary_stem, workspace)

    try:
        other_stem = run_demucs_two_stem(
            source_path=source_path,
            workspace=workspace,
            stem_name="other",
            model_name="htdemucs",
            run_name="other_recovery",
        )
    except Exception:
        return primary_stem

    return blend_recovered_harmonics(primary_stem, other_stem, workspace)


def get_inference_provider() -> InferenceProvider:
    """Return the provider configured in ``PLEXUS_INFERENCE_PROVIDER``."""
    provider = settings.inference_provider.lower()
    if provider == "modal":
        return ModalInferenceProvider()
    if provider == "local":
        return LocalInferenceProvider()
    raise RuntimeError(f"Unsupported inference provider: {settings.inference_provider}")
