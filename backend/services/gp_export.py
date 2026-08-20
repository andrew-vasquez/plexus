"""Writes note events to a Guitar Pro (``.gp5``) file.

The last step of the pipeline. Takes the cleaned, quantized, fret-mapped
notes and lays them out as measures and beats in a Guitar Pro 5 file,
so the result can be opened in Guitar Pro or AlphaTab.

GP files measure time in "ticks" (960 per beat). This module converts
between seconds and ticks using the song's BPM, and snaps every note to
the closest standard note duration (whole → 32nd note).
"""

from __future__ import annotations

import math
from pathlib import Path

import guitarpro
from guitarpro import models as gp

from services.notes.types import TabbedNoteEvent

MAX_FRET = 24
TICKS_PER_BEAT = 960  # GP standard resolution


def midi_pitch_to_string_fret(pitch: int, tuning_map: dict[int, int]) -> tuple[int, int]:
    """Find the lowest-fret (string, fret) that plays ``pitch``.

    Falls back to string 1, fret 0 if the pitch is out of range.
    """
    best: tuple[int, int] | None = None

    for string_num in range(6, 0, -1):
        open_pitch = tuning_map[string_num]
        fret = pitch - open_pitch
        if 0 <= fret <= MAX_FRET and (best is None or fret < best[1]):
            best = (string_num, fret)

    return best or (1, 0)


def seconds_to_ticks(seconds: float, bpm: float) -> int:
    """Convert a time in seconds to GP ticks at the given BPM."""
    beats = seconds * (bpm / 60.0)
    return int(round(beats * TICKS_PER_BEAT))


def duration_ticks_to_gp(ticks: int) -> gp.Duration:
    """Map a duration in ticks to the nearest GP note duration value."""
    choices = [
        (gp.Duration.whole, 3840),
        (gp.Duration.half, 1920),
        (gp.Duration.quarter, 960),
        (gp.Duration.eighth, 480),
        (gp.Duration.sixteenth, 240),
        (gp.Duration.thirtySecond, 120),
    ]
    closest_value = gp.Duration.eighth
    closest_diff = float("inf")

    for duration_value, tick_count in choices:
        diff = abs(ticks - tick_count)
        if diff < closest_diff:
            closest_diff = diff
            closest_value = duration_value

    return gp.Duration(value=closest_value)


def build_gp5(
    note_events: list[TabbedNoteEvent],
    bpm: float = 120.0,
    tuning_map: dict[int, int] | None = None,
    time_signature: tuple[int, int] = (4, 4),
    output_path: str | Path = "output.gp5",
) -> Path:
    """Write note events to a Guitar Pro 5 file.

    Notes are sorted by start time and distributed across measures of the
    requested time signature. Beats between notes become rests, and each
    note is written with the string/fret already chosen by the fretboard
    step (falling back to ``midi_pitch_to_string_fret`` when missing).

    Args:
        note_events: notes with ``start_s``/``end_s``/``pitch_midi``/
            ``amplitude`` and optionally ``string_number``/``fret``.
        bpm: tempo for converting seconds to ticks.
        tuning_map: string number -> open-string MIDI pitch.
        time_signature: ``(numerator, denominator)`` of the song.
        output_path: where to write the ``.gp5`` file.

    Returns:
        The output path.

    Raises:
        ValueError: if there are no notes to export.
    """
    if not note_events:
        raise ValueError("No note events to export")

    ordered_notes = sorted(note_events, key=lambda note: float(note["start_s"]))
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    tuning = tuning_map or {
        1: 64,
        2: 59,
        3: 55,
        4: 50,
        5: 45,
        6: 40,
    }
    numerator, denominator = time_signature
    measure_ticks = int(numerator * TICKS_PER_BEAT * (4 / denominator))

    song = gp.Song()
    song.tempo = int(round(bpm))
    song.title = "Plexus Transcription"
    song.artist = "Plexus"
    song.album = "Plexus MVP"

    track = song.tracks[0]
    track.name = "Guitar"
    track.isPercussionTrack = False
    track.channel.instrument = 27
    track.channel.volume = 13
    track.strings = [gp.GuitarString(number=i, value=tuning[i]) for i in range(1, 7)]

    total_duration_s = float(ordered_notes[-1]["end_s"])
    total_beats = total_duration_s * (bpm / 60.0)
    beats_per_measure = numerator * (4 / denominator)
    total_measures = max(1, math.ceil(total_beats / beats_per_measure))

    song.measureHeaders = []
    track.measures = []

    for index in range(total_measures):
        header = gp.MeasureHeader(number=index + 1, start=index * measure_ticks + TICKS_PER_BEAT)
        header.timeSignature.numerator = numerator
        header.timeSignature.denominator.value = _duration_value_for_denominator(denominator)
        song.measureHeaders.append(header)
        track.measures.append(gp.Measure(track, header))

    for measure in track.measures:
        measure_start = measure.header.start
        measure_end = measure_start + measure_ticks
        voice = measure.voices[0]

        measure_notes = [
            note for note in ordered_notes
            if measure_start <= seconds_to_ticks(float(note["start_s"]), bpm) + TICKS_PER_BEAT < measure_end
        ]

        if not measure_notes:
            rest_beat = gp.Beat(
                voice,
                start=measure_start,
                duration=duration_ticks_to_gp(measure_ticks),
                status=gp.BeatStatus.rest,
            )
            voice.beats.append(rest_beat)
            continue

        cursor = measure_start

        for note_event in measure_notes:
            note_start = seconds_to_ticks(float(note_event["start_s"]), bpm) + TICKS_PER_BEAT
            note_end = seconds_to_ticks(float(note_event["end_s"]), bpm) + TICKS_PER_BEAT
            note_duration_ticks = max(120, note_end - note_start)

            if note_start > cursor:
                voice.beats.append(
                    gp.Beat(
                        voice,
                        start=cursor,
                        duration=duration_ticks_to_gp(note_start - cursor),
                        status=gp.BeatStatus.rest,
                    )
                )

            beat = gp.Beat(
                voice,
                start=note_start,
                duration=duration_ticks_to_gp(note_duration_ticks),
                status=gp.BeatStatus.normal,
            )
            string_num = int(note_event.get("string_number", 0)) or midi_pitch_to_string_fret(int(note_event["pitch_midi"]), tuning)[0]
            fret = int(note_event.get("fret", -1))
            if fret < 0:
                _, fret = midi_pitch_to_string_fret(int(note_event["pitch_midi"]), tuning)
            velocity = max(1, min(127, int(float(note_event["amplitude"]) * 127)))
            beat.notes.append(
                gp.Note(
                    beat,
                    value=fret,
                    velocity=velocity,
                    string=string_num,
                    type=gp.NoteType.normal,
                )
            )
            voice.beats.append(beat)
            cursor = note_start + int(beat.duration.time)

        if cursor < measure_end:
            voice.beats.append(
                gp.Beat(
                    voice,
                    start=cursor,
                    duration=duration_ticks_to_gp(measure_end - cursor),
                    status=gp.BeatStatus.rest,
                )
            )

    guitarpro.write(song, str(output))
    return output


def _duration_value_for_denominator(denominator: int) -> int:
    if denominator == 8:
        return gp.Duration.eighth
    return gp.Duration.quarter
