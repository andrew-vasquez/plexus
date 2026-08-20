"""Exports cleaned note events to MIDI and API previews."""

from __future__ import annotations

from pathlib import Path

import pretty_midi

from services.notes.options import MIN_NOTE_DURATION_S, PREVIEW_NOTE_LIMIT
from services.notes.types import TabbedNoteEvent


def note_preview(
    note_events: list[TabbedNoteEvent],
    limit: int = PREVIEW_NOTE_LIMIT,
) -> list[TabbedNoteEvent]:
    """Return only the first few notes for API responses.

    Full transcriptions can be thousands of notes; the preview keeps
    payloads small while still giving the frontend something to render.
    """
    return note_events[:limit]


def write_midi_from_note_events(
    note_events: list[TabbedNoteEvent],
    output_path: str | Path,
) -> Path:
    """Write note events to a MIDI file using ``pretty_midi``.

    Velocity is derived from the note amplitude; every note is guaranteed
    a minimum duration so even very short notes show up in MIDI editors.

    Args:
        note_events: cleaned notes with ``start_s``/``end_s``/``pitch_midi``/
            ``amplitude``.
        output_path: where to write the ``.mid`` file.

    Returns:
        The output path.
    """
    midi = pretty_midi.PrettyMIDI()
    instrument = pretty_midi.Instrument(program=27, name="Plexus Guitar")

    for note in note_events:
        velocity = max(1, min(127, int(float(note["amplitude"]) * 127)))
        instrument.notes.append(
            pretty_midi.Note(
                velocity=velocity,
                pitch=int(note["pitch_midi"]),
                start=float(note["start_s"]),
                end=max(
                    float(note["end_s"]), float(note["start_s"]) + MIN_NOTE_DURATION_S
                ),
            )
        )

    midi.instruments.append(instrument)
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    midi.write(str(out))
    return out
