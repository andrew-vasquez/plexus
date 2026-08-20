"""Snaps note timing onto a rhythmic grid.

Basic Pitch reports onsets at arbitrary milliseconds, but tab notation
needs notes to fall exactly on beat subdivisions. This module rounds each
note's start/end to the nearest grid step and merges the duplicates that
rounding creates.
"""

from __future__ import annotations

from typing import cast

from services.notes.types import NoteEvent


def quantize_note_events(
    note_events: list[NoteEvent],
    bpm: float,
    mode: str,
) -> list[NoteEvent]:
    """Round note times to the nearest subdivision of a beat.

    The grid step is a subdivision of the beat:
    - ``rhythm`` mode uses eighth notes (2 steps per beat)
    - every other mode uses sixteenth notes (4 steps per beat)

    Returns a new list sorted by start time, with duplicates merged.
    """
    if not note_events:
        return []

    subdivisions = 2 if mode == "rhythm" else 4
    step_seconds = 60.0 / bpm / subdivisions
    quantized: list[NoteEvent] = []

    for note in note_events:
        start_s = round(float(note["start_s"]) / step_seconds) * step_seconds
        end_s = round(float(note["end_s"]) / step_seconds) * step_seconds
        if end_s <= start_s:
            end_s = start_s + step_seconds

        quantized.append(
            {
                "start_s": max(0.0, start_s),
                "end_s": end_s,
                "pitch_midi": int(note["pitch_midi"]),
                "amplitude": float(note["amplitude"]),
            }
        )

    quantized.sort(key=lambda note: (float(note["start_s"]), int(note["pitch_midi"])))

    deduped: list[NoteEvent] = []
    for note in quantized:
        if not deduped:
            deduped.append(note)
            continue

        previous = deduped[-1]
        if (
            int(previous["pitch_midi"]) == int(note["pitch_midi"])
            and abs(float(previous["start_s"]) - float(note["start_s"]))
            < step_seconds / 2
        ):
            previous["end_s"] = max(float(previous["end_s"]), float(note["end_s"]))
            previous["amplitude"] = max(
                float(previous["amplitude"]), float(note["amplitude"])
            )
            continue

        deduped.append(note)

    return _merge_adjacent_quantized_groups(deduped, step_seconds)


def _merge_adjacent_quantized_groups(
    note_events: list[NoteEvent],
    step_seconds: float,
) -> list[NoteEvent]:
    """Join notes that quantized to the same moment across neighboring groups.

    If two successive grid steps have identical pitch sets and almost no
    gap between them, they were probably one sustained chord that Basic
    Pitch reported twice — so they merge into a single chord.
    """
    if len(note_events) < 2:
        return note_events

    grouped: list[list[NoteEvent]] = []
    current_group: list[NoteEvent] = [note_events[0]]

    for note in note_events[1:]:
        if abs(float(note["start_s"]) - float(current_group[0]["start_s"])) < 1e-6:
            current_group.append(note)
            continue
        grouped.append(current_group)
        current_group = [note]

    grouped.append(current_group)

    merged_groups: list[list[NoteEvent]] = [grouped[0]]
    for group in grouped[1:]:
        previous_group = merged_groups[-1]
        previous_start = float(previous_group[0]["start_s"])
        current_start = float(group[0]["start_s"])
        previous_pitches = {int(note["pitch_midi"]) for note in previous_group}
        current_pitches = {int(note["pitch_midi"]) for note in group}
        previous_end = max(float(note["end_s"]) for note in previous_group)

        if previous_pitches == current_pitches and current_start <= previous_end + (
            step_seconds / 4
        ):
            merged_by_pitch: dict[int, NoteEvent] = {
                int(note["pitch_midi"]): cast(NoteEvent, dict(note))
                for note in previous_group
            }
            for note in group:
                pitch = int(note["pitch_midi"])
                merged_note = merged_by_pitch[pitch]
                merged_note["end_s"] = max(
                    float(merged_note["end_s"]), float(note["end_s"])
                )
                merged_note["amplitude"] = max(
                    float(merged_note["amplitude"]), float(note["amplitude"])
                )
                merged_note["start_s"] = previous_start
            merged_groups[-1] = list(merged_by_pitch.values())
            continue

        merged_groups.append(group)

    flattened = [note for group in merged_groups for note in group]
    flattened.sort(key=lambda note: (float(note["start_s"]), int(note["pitch_midi"])))
    return flattened
