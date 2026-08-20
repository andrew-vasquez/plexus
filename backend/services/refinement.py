from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass
from pathlib import Path

from core.config import settings
from services.notes.options import TranscriptionOptions
from services.notes.types import NoteEvent


@dataclass(frozen=True)
class RefinementContext:
    job_id: str
    stem_path: Path
    source_filename: str
    bpm: float
    tuning_map: dict[int, int]
    options: TranscriptionOptions


class RefinementProvider(ABC):
    @abstractmethod
    def refine(
        self,
        note_events: list[NoteEvent],
        context: RefinementContext,
    ) -> list[NoteEvent]:
        raise NotImplementedError


class NoopRefinementProvider(RefinementProvider):
    def refine(
        self,
        note_events: list[NoteEvent],
        context: RefinementContext,
    ) -> list[NoteEvent]:
        return note_events


class DumpRefinementProvider(RefinementProvider):
    def refine(
        self,
        note_events: list[NoteEvent],
        context: RefinementContext,
    ) -> list[NoteEvent]:
        dump_payload = {
            "job_id": context.job_id,
            "source_filename": context.source_filename,
            "stem_path": str(context.stem_path),
            "bpm": context.bpm,
            "tuning_map": context.tuning_map,
            "options": asdict(context.options),
            "note_events": note_events,
        }
        dump_path = settings.refinement_dump_dir / f"{context.job_id}.json"
        dump_path.write_text(json.dumps(dump_payload, indent=2), encoding="utf-8")
        return note_events


def get_refinement_provider() -> RefinementProvider:
    provider = settings.refinement_provider.lower()
    if provider == "dump":
        return DumpRefinementProvider()
    return NoopRefinementProvider()
