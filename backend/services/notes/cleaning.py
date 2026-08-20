"""Turns raw Basic Pitch output into clean, plausible note events.

Basic Pitch detects every pitch it can hear — including harmonics, bleed
from other instruments, and ghost notes. This module removes the noise
and keeps only notes that look like real playing.

The ``mode`` chosen by the user changes how aggressive this filtering is:

- ``riff``   — single-note riffs: keeps one strong note per onset, and
  optionally a perfect-fifth companion (power chords).
- ``lead``   — melodic lead lines: one note per onset, wider pitch range.
- ``rhythm`` — strummed parts: keeps up to two notes per onset.
"""

from __future__ import annotations

from services.notes.options import (
    MIN_NOTE_DURATION_S,
    SAME_PITCH_MERGE_GAP_S,
    TranscriptionOptions,
    guitar_pitch_bounds,
)
from services.notes.types import NoteEvent

# One tuning profile per mode. Values were tuned against the Smoke on the
# Water riff benchmark — change them with care.
MODE_PROFILES: dict[str, dict[str, float]] = {
    "riff": {
        "amplitude_threshold": 0.46,  # drop notes quieter than this
        "onset_bucket_s": 0.09,  # onsets within this window count as one
        "max_pitch_cap": 67,  # ignore pitches above this (MIDI)
        "register_window": 9,  # how far notes may stray from the riff register
        "pitch_window": 12,  # size of the dominant pitch window
        "same_pitch_merge_gap_s": 0.08,
    },
    "lead": {
        "amplitude_threshold": 0.4,
        "onset_bucket_s": 0.1,
        "max_pitch_cap": 76,
        "register_window": 12,
        "same_pitch_merge_gap_s": 0.05,
    },
    "rhythm": {
        "amplitude_threshold": 0.3,
        "onset_bucket_s": 0.14,
        "max_pitch_cap": 72,
        "register_window": 15,
        "same_pitch_merge_gap_s": 0.06,
    },
}


def clean_note_events(
    note_events: list[NoteEvent],
    options: TranscriptionOptions,
    tuning_map: dict[int, int],
) -> list[NoteEvent]:
    """Remove false positives and duplicates from raw note events.

    Pipeline (in order):
    1. Filter out notes that are out of range, too short, or too quiet.
    2. Merge notes of the same pitch that run into each other (sustain).
    3. Collapse near-simultaneous onsets into one "bucket" and pick the
       strongest note(s) per bucket.
    4. Suppress pitch outliers and keep the dominant register, per mode.

    Returns the cleaned list (possibly empty).
    """
    mode_profile = MODE_PROFILES.get(options.mode, MODE_PROFILES["lead"])
    min_pitch, max_pitch = guitar_pitch_bounds(tuning_map)
    max_pitch = min(max_pitch, int(mode_profile["max_pitch_cap"]))
    amplitude_threshold = mode_profile["amplitude_threshold"]
    onset_bucket_s = mode_profile["onset_bucket_s"]
    same_pitch_merge_gap_s = mode_profile.get(
        "same_pitch_merge_gap_s", SAME_PITCH_MERGE_GAP_S
    )

    filtered = _filter_out_of_range_and_weak_notes(
        note_events,
        min_pitch=min_pitch,
        max_pitch=max_pitch,
        amplitude_threshold=amplitude_threshold,
    )

    if not filtered:
        return []

    merged = _merge_same_pitch_sustains(filtered, same_pitch_merge_gap_s)
    bucketed = _collapse_onsets_into_buckets(merged, onset_bucket_s, options.mode)

    stabilized = suppress_outlier_jumps(bucketed)
    if options.mode == "riff":
        stabilized = constrain_riff_pitch_window(
            stabilized,
            window=int(mode_profile.get("pitch_window", 12)),
        )

    if options.mode in {"riff", "lead"}:
        stabilized = constrain_dominant_register(
            stabilized,
            window=int(mode_profile["register_window"]),
        )

    if options.mode == "riff":
        stabilized = suppress_riff_low_bleed(
            stabilized,
            low_window=max(4, int(mode_profile["register_window"]) - 3),
        )

    return stabilized


# ---------------------------------------------------------------------------
# Cleaning stages
# ---------------------------------------------------------------------------


def _filter_out_of_range_and_weak_notes(
    note_events: list[NoteEvent],
    *,
    min_pitch: int,
    max_pitch: int,
    amplitude_threshold: float,
) -> list[NoteEvent]:
    """Drop notes that can't be played or are too faint/short to trust."""
    filtered: list[NoteEvent] = []
    for note in sorted(
        note_events,
        key=lambda item: (float(item["start_s"]), -float(item["amplitude"])),
    ):
        pitch = int(note["pitch_midi"])
        start_s = float(note["start_s"])
        end_s = float(note["end_s"])
        amplitude = float(note["amplitude"])
        duration = end_s - start_s

        if pitch < min_pitch or pitch > max_pitch:
            continue
        if duration < MIN_NOTE_DURATION_S:
            continue
        if amplitude < amplitude_threshold:
            continue

        filtered.append(
            {
                "start_s": start_s,
                "end_s": end_s,
                "pitch_midi": pitch,
                "amplitude": amplitude,
            }
        )

    return filtered


def _merge_same_pitch_sustains(
    note_events: list[NoteEvent],
    same_pitch_merge_gap_s: float,
) -> list[NoteEvent]:
    """Join consecutive notes of the same pitch into one sustained note."""
    merged: list[NoteEvent] = []
    for note in note_events:
        if not merged:
            merged.append(note)
            continue

        previous = merged[-1]
        same_pitch = int(previous["pitch_midi"]) == int(note["pitch_midi"])
        near_sustain = (
            float(note["start_s"]) <= float(previous["end_s"]) + same_pitch_merge_gap_s
        )

        if same_pitch and near_sustain:
            previous["end_s"] = max(float(previous["end_s"]), float(note["end_s"]))
            previous["amplitude"] = max(
                float(previous["amplitude"]), float(note["amplitude"])
            )
            continue

        merged.append(note)

    return merged


def _collapse_onsets_into_buckets(
    note_events: list[NoteEvent],
    onset_bucket_s: float,
    mode: str,
) -> list[NoteEvent]:
    """Group near-simultaneous onsets and keep the strongest note(s).

    A chord rings every string at (nearly) the same moment, so Basic Pitch
    reports several notes with one onset. Each group of notes that starts
    within ``onset_bucket_s`` of each other becomes one bucket, and
    ``select_bucket_notes`` decides which notes represent that bucket.
    """
    bucketed: list[NoteEvent] = []
    bucket: list[NoteEvent] = []
    bucket_start = float(note_events[0]["start_s"])

    for note in note_events:
        note_start = float(note["start_s"])
        if note_start - bucket_start <= onset_bucket_s:
            bucket.append(note)
            continue

        bucketed.extend(select_bucket_notes(bucket, mode))
        bucket = [note]
        bucket_start = note_start

    if bucket:
        bucketed.extend(select_bucket_notes(bucket, mode))

    return bucketed


def select_bucket_notes(
    bucket: list[NoteEvent],
    mode: str,
) -> list[NoteEvent]:
    """Pick which note(s) from one onset bucket make it into the tab.

    All returned notes share the bucket's start/end times.
    """
    ordered = sorted(bucket, key=lambda note: float(note["amplitude"]), reverse=True)
    if mode == "riff":
        strongest = ordered[0]
        riff_notes = [strongest]
        for candidate in ordered[1:4]:
            if should_keep_riff_companion(candidate, strongest):
                riff_notes.append(candidate)
                break

        start_s = min(float(note["start_s"]) for note in bucket)
        end_s = max(float(note["end_s"]) for note in bucket)
        return [
            {
                "start_s": start_s,
                "end_s": end_s,
                "pitch_midi": int(note["pitch_midi"]),
                "amplitude": float(note["amplitude"]),
            }
            for note in sorted(riff_notes, key=lambda note: int(note["pitch_midi"]))
        ]

    if mode == "lead":
        strongest = ordered[0]
        return [
            {
                "start_s": min(float(note["start_s"]) for note in bucket),
                "end_s": max(float(note["end_s"]) for note in bucket),
                "pitch_midi": int(strongest["pitch_midi"]),
                "amplitude": float(strongest["amplitude"]),
            }
        ]

    return ordered[:2]


def should_keep_riff_companion(
    candidate: NoteEvent,
    strongest: NoteEvent,
) -> bool:
    """Should a quieter onset note be kept alongside the strongest one?

    Keeps only perfect fifths/sevenths/octaves that are nearly as loud as
    the strongest note — the signature of a power chord or octave-doubled
    riff.
    """
    strongest_pitch = int(strongest["pitch_midi"])
    candidate_pitch = int(candidate["pitch_midi"])
    interval = abs(strongest_pitch - candidate_pitch)
    amplitude_ratio = float(candidate["amplitude"]) / max(
        float(strongest["amplitude"]), 0.001
    )

    return interval in {5, 7, 12} and amplitude_ratio >= 0.72


def suppress_outlier_jumps(
    note_events: list[NoteEvent],
) -> list[NoteEvent]:
    """Drop isolated notes that jump far away and right back.

    A lone, quiet note an octave above everything around it is almost
    always a false positive (harmonic bleed), so it gets removed.
    """
    if len(note_events) < 3:
        return note_events

    stabilized = [note_events[0]]
    for index in range(1, len(note_events) - 1):
        previous = stabilized[-1]
        current = note_events[index]
        following = note_events[index + 1]

        previous_pitch = int(previous["pitch_midi"])
        current_pitch = int(current["pitch_midi"])
        next_pitch = int(following["pitch_midi"])

        if (
            abs(current_pitch - previous_pitch) >= 12
            and abs(next_pitch - previous_pitch) <= 5
            and float(current["amplitude"])
            < max(float(previous["amplitude"]), float(following["amplitude"]))
        ):
            continue

        stabilized.append(current)

    stabilized.append(note_events[-1])
    return stabilized


def constrain_dominant_register(
    note_events: list[NoteEvent],
    window: int,
) -> list[NoteEvent]:
    """Drop notes far outside the song's dominant pitch register.

    Finds the amplitude-weighted center pitch of the strongest notes and
    keeps only notes within ``window`` semitones of it (very loud notes
    are always kept).
    """
    if len(note_events) < 4:
        return note_events

    strongest = sorted(
        note_events, key=lambda note: float(note["amplitude"]), reverse=True
    )[:24]
    weighted_pitch_sum = sum(
        int(note["pitch_midi"]) * float(note["amplitude"]) for note in strongest
    )
    total_weight = sum(float(note["amplitude"]) for note in strongest)
    if total_weight <= 0:
        return note_events

    center_pitch = round(weighted_pitch_sum / total_weight)
    constrained = [
        note
        for note in note_events
        if abs(int(note["pitch_midi"]) - center_pitch) <= window
        or float(note["amplitude"]) >= 0.82
    ]
    return constrained or note_events


def constrain_riff_pitch_window(
    note_events: list[NoteEvent],
    window: int,
) -> list[NoteEvent]:
    """Keep riff notes inside the densest pitch band on the fretboard.

    Finds the ``window``-sized range of pitches that carries the most
    note energy (the actual riff) and drops everything outside it.
    """
    if len(note_events) < 4:
        return note_events

    strongest = sorted(
        note_events, key=lambda note: float(note["amplitude"]), reverse=True
    )[:48]
    pitch_weights: dict[int, float] = {}
    for note in strongest:
        pitch = int(note["pitch_midi"])
        pitch_weights[pitch] = pitch_weights.get(pitch, 0.0) + float(note["amplitude"])

    best_start: int | None = None
    best_weight = 0.0
    for start_pitch in range(min(pitch_weights), max(pitch_weights) + 1):
        total_weight = sum(
            weight
            for pitch, weight in pitch_weights.items()
            if start_pitch <= pitch <= start_pitch + window
        )
        if total_weight > best_weight:
            best_weight = total_weight
            best_start = start_pitch

    if best_start is None:
        return note_events

    low_bound = best_start
    high_bound = best_start + window
    constrained = [
        note
        for note in note_events
        if low_bound <= int(note["pitch_midi"]) <= high_bound
    ]
    return constrained or note_events


def suppress_riff_low_bleed(
    note_events: list[NoteEvent],
    low_window: int,
) -> list[NoteEvent]:
    """Drop suspiciously low notes under a riff.

    Demucs' ``other`` stem sometimes bleeds bass frequencies into the
    guitar stem. This removes notes far below the riff's center pitch.
    """
    if len(note_events) < 4:
        return note_events

    strongest = sorted(
        note_events, key=lambda note: float(note["amplitude"]), reverse=True
    )[:24]
    weighted_pitch_sum = sum(
        int(note["pitch_midi"]) * float(note["amplitude"]) for note in strongest
    )
    total_weight = sum(float(note["amplitude"]) for note in strongest)
    if total_weight <= 0:
        return note_events

    center_pitch = round(weighted_pitch_sum / total_weight)
    low_bound = center_pitch - low_window
    constrained = [note for note in note_events if int(note["pitch_midi"]) >= low_bound]
    return constrained or note_events
