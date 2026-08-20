"""Transcription options, tuning presets, and shared note constants.

Every piece of the note pipeline agrees on these values: what tuning the
guitar is in, what fret range is reachable, and what the user asked for
(tempo, mode, time signature, capo).
"""

from __future__ import annotations

from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Shared constants
# ---------------------------------------------------------------------------

MAX_FRET = 24
"""Highest fret we assume the guitar can reach."""

MIN_NOTE_DURATION_S = 0.08
"""Notes shorter than this are treated as noise and dropped."""

PREVIEW_NOTE_LIMIT = 32
"""How many notes the API returns in the response preview."""

SAME_PITCH_MERGE_GAP_S = 0.05
"""Default gap used to merge two notes of the same pitch into one."""

# ---------------------------------------------------------------------------
# Tuning presets: string number -> open-string MIDI pitch
# ---------------------------------------------------------------------------

TUNING_PRESETS: dict[str, dict[int, int]] = {
    "standard": {
        1: 64,  # high e
        2: 59,  # B
        3: 55,  # G
        4: 50,  # D
        5: 45,  # A
        6: 40,  # low E
    },
    "drop_d": {
        1: 64,
        2: 59,
        3: 55,
        4: 50,
        5: 45,
        6: 38,  # low E dropped to D
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

# ---------------------------------------------------------------------------
# Transcription options
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class TranscriptionOptions:
    """User-controlled knobs for one transcription job.

    Attributes:
        bpm: tempo override; ``None`` means "detect from the audio".
        tuning: which guitar tuning to write the tab in.
        capo: capo position on the first fret, transposing all open strings.
        mode: ``"riff"``, ``"lead"``, or ``"rhythm"`` — changes how
            aggressive note cleaning is.
        time_signature_numerator/denominator: the meter of the song.
    """

    bpm: float | None = None
    tuning: str = "standard"
    capo: int = 0
    mode: str = "riff"
    time_signature_numerator: int = 4
    time_signature_denominator: int = 4

    @property
    def time_signature(self) -> str:
        """The time signature as a human-readable string like ``"4/4"``."""
        return f"{self.time_signature_numerator}/{self.time_signature_denominator}"


# ---------------------------------------------------------------------------
# Tuning / time signature helpers
# ---------------------------------------------------------------------------


def parse_time_signature(value: str) -> tuple[int, int]:
    """Parse ``"4/4"``-style input into ``(numerator, denominator)``.

    Raises:
        ValueError: if the value isn't a supported time signature.
    """
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
    """Return the open-string MIDI pitches for a tuning preset, plus capo.

    The capo shifts every string up by ``capo`` semitones. The result maps
    string number (1 = high e) to the MIDI pitch of the open string.
    """
    if tuning not in TUNING_PRESETS:
        raise ValueError(f"Unsupported tuning preset: {tuning}")
    return {
        string_num: pitch + capo for string_num, pitch in TUNING_PRESETS[tuning].items()
    }


def guitar_pitch_bounds(tuning_map: dict[int, int]) -> tuple[int, int]:
    """Return ``(lowest, highest)`` MIDI pitch reachable on this guitar.

    Lowest is the fattest open string; highest is the thinnest string
    fretted at ``MAX_FRET``.
    """
    open_pitches = tuning_map.values()
    return min(open_pitches), max(open_pitches) + MAX_FRET
