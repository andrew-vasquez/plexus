"""Chooses a string and fret for every pitch.

Most pitches can be played in several places on the neck (e.g. an A on
string 3 fret 2, string 4 fret 7, or string 5 fret 12). This module picks
the position that is easiest to play, and — more importantly — the one
closest to the previous note, so the hand doesn't have to jump around.
"""

from __future__ import annotations

from services.notes.options import MAX_FRET
from services.notes.types import NoteEvent, TabbedNoteEvent


def assign_fretboard_positions(
    note_events: list[NoteEvent],
    tuning_map: dict[int, int],
    mode: str,
) -> list[TabbedNoteEvent]:
    """Add ``string_number`` and ``fret`` to every note event.

    The first note picks the position with the lowest cost on its own;
    every note after that is placed near the previous note's position.
    Returns a new list — the input is not modified.
    """
    assigned: list[TabbedNoteEvent] = []
    previous_choice: TabbedNoteEvent | None = None

    for note in note_events:
        candidates = fret_candidates(int(note["pitch_midi"]), tuning_map)
        if not candidates:
            continue

        if previous_choice is None:
            chosen = min(
                candidates,
                key=lambda candidate: starting_candidate_cost(candidate, mode),
            )
        else:
            previous = previous_choice
            chosen = min(
                candidates,
                key=lambda candidate: candidate_cost(candidate, previous, mode),
            )

        assigned_note: TabbedNoteEvent = {
            "start_s": float(note["start_s"]),
            "end_s": float(note["end_s"]),
            "pitch_midi": int(note["pitch_midi"]),
            "amplitude": float(note["amplitude"]),
            "string_number": chosen["string_number"],
            "fret": chosen["fret"],
        }
        assigned.append(assigned_note)
        previous_choice = assigned_note

    return assigned


def fret_candidates(pitch: int, tuning_map: dict[int, int]) -> list[dict[str, int]]:
    """Return every ``(string_number, fret)`` that can play ``pitch``."""
    candidates = []
    for string_num in range(6, 0, -1):
        fret = pitch - tuning_map[string_num]
        if 0 <= fret <= MAX_FRET:
            candidates.append({"string_number": string_num, "fret": fret})
    return candidates


def starting_candidate_cost(candidate: dict[str, int], mode: str) -> float:
    """Cost of a position with no previous note to compare against.

    Lower frets are cheaper; for riff/rhythm parts, higher (thinner)
    strings are preferred as well.
    """
    cost = float(candidate["fret"])
    if mode in {"riff", "rhythm"}:
        cost += (6 - candidate["string_number"]) * 0.5
    return cost


def candidate_cost(
    candidate: dict[str, int],
    previous_choice: TabbedNoteEvent,
    mode: str,
) -> float:
    """Cost of a position given where the previous note was played.

    Moving fingers a long distance is expensive, so positions close to
    the previous note win. High frets are penalized for comfort.
    """
    previous_fret = int(previous_choice["fret"])
    previous_string = int(previous_choice["string_number"])
    fret_distance = abs(candidate["fret"] - previous_fret)
    string_distance = abs(candidate["string_number"] - previous_string)

    cost = fret_distance * 2.0 + string_distance * 1.5
    if candidate["fret"] > 12:
        cost += (candidate["fret"] - 12) * 0.8
    if mode == "riff":
        cost += (6 - candidate["string_number"]) * 0.35
    return cost
