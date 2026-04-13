from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pretty_midi


MAX_FRET = 24
MIN_NOTE_DURATION_S = 0.08
PREVIEW_NOTE_LIMIT = 32
SAME_PITCH_MERGE_GAP_S = 0.05

MODE_PROFILES: dict[str, dict[str, float]] = {
    "riff": {
        "amplitude_threshold": 0.46,
        "onset_bucket_s": 0.09,
        "max_pitch_cap": 67,
        "register_window": 9,
        "pitch_window": 12,
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

TUNING_PRESETS: dict[str, dict[int, int]] = {
    "standard": {
        1: 64,
        2: 59,
        3: 55,
        4: 50,
        5: 45,
        6: 40,
    },
    "drop_d": {
        1: 64,
        2: 59,
        3: 55,
        4: 50,
        5: 45,
        6: 38,
    },
    "half_step_down": {
        1: 63,
        2: 58,
        3: 54,
        4: 49,
        5: 44,
        6: 39,
    },
}


@dataclass(frozen=True)
class TranscriptionOptions:
    bpm: float | None = None
    tuning: str = "standard"
    capo: int = 0
    mode: str = "riff"
    time_signature_numerator: int = 4
    time_signature_denominator: int = 4

    @property
    def time_signature(self) -> str:
        return f"{self.time_signature_numerator}/{self.time_signature_denominator}"


def parse_time_signature(value: str) -> tuple[int, int]:
    try:
        numerator_text, denominator_text = value.split("/", maxsplit=1)
        numerator = int(numerator_text)
        denominator = int(denominator_text)
    except ValueError as exc:
        raise ValueError("Time signature must look like 4/4 or 3/4") from exc

    if numerator not in {2, 3, 4, 6} or denominator not in {4, 8}:
        raise ValueError("Only common time signatures are supported in this MVP")

    return numerator, denominator


def resolve_tuning_map(tuning: str, capo: int = 0) -> dict[int, int]:
    if tuning not in TUNING_PRESETS:
        raise ValueError(f"Unsupported tuning preset: {tuning}")
    return {
        string_num: pitch + capo for string_num, pitch in TUNING_PRESETS[tuning].items()
    }


def guitar_pitch_bounds(tuning_map: dict[int, int]) -> tuple[int, int]:
    open_pitches = tuning_map.values()
    return min(open_pitches), max(open_pitches) + MAX_FRET


def detect_bpm_from_stem(stem_path: Path) -> float:
    try:
        import librosa
    except ImportError:
        return 120.0

    try:
        audio, sample_rate = librosa.load(str(stem_path), sr=None, mono=True)
        tempo, _beats = librosa.beat.beat_track(y=audio, sr=sample_rate)
        tempo_value = float(tempo)
        if tempo_value > 0:
            return tempo_value
    except Exception:
        return 120.0

    return 120.0


def clean_note_events(
    note_events: list[dict[str, float | int]],
    options: TranscriptionOptions,
    tuning_map: dict[int, int],
) -> list[dict[str, float | int]]:
    mode_profile = MODE_PROFILES.get(options.mode, MODE_PROFILES["lead"])
    min_pitch, max_pitch = guitar_pitch_bounds(tuning_map)
    max_pitch = min(max_pitch, int(mode_profile["max_pitch_cap"]))
    amplitude_threshold = mode_profile["amplitude_threshold"]
    onset_bucket_s = mode_profile["onset_bucket_s"]
    same_pitch_merge_gap_s = mode_profile.get(
        "same_pitch_merge_gap_s", SAME_PITCH_MERGE_GAP_S
    )

    filtered: list[dict[str, float | int]] = []
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

    if not filtered:
        return []

    merged: list[dict[str, float | int]] = []
    for note in filtered:
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

    bucketed: list[dict[str, float | int]] = []
    bucket: list[dict[str, float | int]] = []
    bucket_start = float(merged[0]["start_s"])

    for note in merged:
        note_start = float(note["start_s"])
        if note_start - bucket_start <= onset_bucket_s:
            bucket.append(note)
            continue

        bucketed.extend(_select_bucket_notes(bucket, options.mode))
        bucket = [note]
        bucket_start = note_start

    if bucket:
        bucketed.extend(_select_bucket_notes(bucket, options.mode))

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


def _select_bucket_notes(
    bucket: list[dict[str, float | int]],
    mode: str,
) -> list[dict[str, float | int]]:
    ordered = sorted(bucket, key=lambda note: float(note["amplitude"]), reverse=True)
    if mode == "riff":
        strongest = ordered[0]
        riff_notes = [strongest]
        for candidate in ordered[1:4]:
            if _should_keep_riff_companion(candidate, strongest):
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


def _should_keep_riff_companion(
    candidate: dict[str, float | int],
    strongest: dict[str, float | int],
) -> bool:
    strongest_pitch = int(strongest["pitch_midi"])
    candidate_pitch = int(candidate["pitch_midi"])
    interval = abs(strongest_pitch - candidate_pitch)
    amplitude_ratio = float(candidate["amplitude"]) / max(
        float(strongest["amplitude"]), 0.001
    )

    return interval in {5, 7, 12} and amplitude_ratio >= 0.72


def suppress_outlier_jumps(
    note_events: list[dict[str, float | int]],
) -> list[dict[str, float | int]]:
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
    note_events: list[dict[str, float | int]],
    window: int,
) -> list[dict[str, float | int]]:
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
    note_events: list[dict[str, float | int]],
    window: int,
) -> list[dict[str, float | int]]:
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
    note_events: list[dict[str, float | int]],
    low_window: int,
) -> list[dict[str, float | int]]:
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


def quantize_note_events(
    note_events: list[dict[str, float | int]],
    bpm: float,
    mode: str,
) -> list[dict[str, float | int]]:
    if not note_events:
        return []

    subdivisions = 2 if mode == "rhythm" else 4
    step_seconds = 60.0 / bpm / subdivisions
    quantized: list[dict[str, float | int]] = []

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

    deduped: list[dict[str, float | int]] = []
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
    note_events: list[dict[str, float | int]],
    step_seconds: float,
) -> list[dict[str, float | int]]:
    if len(note_events) < 2:
        return note_events

    grouped: list[list[dict[str, float | int]]] = []
    current_group: list[dict[str, float | int]] = [note_events[0]]

    for note in note_events[1:]:
        if abs(float(note["start_s"]) - float(current_group[0]["start_s"])) < 1e-6:
            current_group.append(note)
            continue
        grouped.append(current_group)
        current_group = [note]

    grouped.append(current_group)

    merged_groups: list[list[dict[str, float | int]]] = [grouped[0]]
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
            merged_by_pitch = {
                int(note["pitch_midi"]): dict(note) for note in previous_group
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


def assign_fretboard_positions(
    note_events: list[dict[str, float | int]],
    tuning_map: dict[int, int],
    mode: str,
) -> list[dict[str, float | int]]:
    assigned: list[dict[str, float | int]] = []
    previous_choice: dict[str, float | int] | None = None

    for note in note_events:
        candidates = fret_candidates(int(note["pitch_midi"]), tuning_map)
        if not candidates:
            continue

        if previous_choice is None:
            chosen = min(
                candidates,
                key=lambda candidate: _starting_candidate_cost(candidate, mode),
            )
        else:
            chosen = min(
                candidates,
                key=lambda candidate: _candidate_cost(candidate, previous_choice, mode),
            )

        assigned_note = dict(note)
        assigned_note["string_number"] = chosen["string_number"]
        assigned_note["fret"] = chosen["fret"]
        assigned.append(assigned_note)
        previous_choice = assigned_note

    return assigned


def fret_candidates(pitch: int, tuning_map: dict[int, int]) -> list[dict[str, int]]:
    candidates = []
    for string_num in range(6, 0, -1):
        fret = pitch - tuning_map[string_num]
        if 0 <= fret <= MAX_FRET:
            candidates.append({"string_number": string_num, "fret": fret})
    return candidates


def _starting_candidate_cost(candidate: dict[str, int], mode: str) -> float:
    cost = float(candidate["fret"])
    if mode in {"riff", "rhythm"}:
        cost += (6 - candidate["string_number"]) * 0.5
    return cost


def _candidate_cost(
    candidate: dict[str, int],
    previous_choice: dict[str, float | int],
    mode: str,
) -> float:
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


def note_preview(
    note_events: list[dict[str, float | int]],
    limit: int = PREVIEW_NOTE_LIMIT,
) -> list[dict[str, float | int]]:
    return note_events[:limit]


def write_midi_from_note_events(
    note_events: list[dict[str, float | int]],
    output_path: str | Path,
) -> Path:
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
