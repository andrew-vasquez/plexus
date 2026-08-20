"""Audio-level helpers for guitar transcription.

This package groups everything that works directly with audio files:

- ``demucs``      — running Demucs source separation as a subprocess
- ``enhancement`` — post-processing guitar stems (filtering, blending, previews)
- ``tempo``       — detecting the BPM of an audio file
"""

from __future__ import annotations
