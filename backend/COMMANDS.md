# Plexus — Backend Command Reference

## Before anything else

Always navigate to the backend folder and activate the venv first.
Without this step nothing will work.

```bash
cd plexus/backend
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal prompt before running any command below.

---

## Running Demucs

### Transcription pipeline — guitar stem only
Used when you want to isolate guitar before transcribing to a tab.

```bash
python3 -m demucs -n htdemucs_6s --two-stems=guitar --mp3 your_song.mp3
```

Output location:
```
backend/separated/htdemucs_6s/your_song/guitar.mp3
backend/separated/htdemucs_6s/your_song/no_guitar.mp3
```

### Stem separation feature — all six stems
Used when a user wants to remove or isolate individual instruments.

```bash
python3 -m demucs -n htdemucs_6s --mp3 your_song.mp3
```

Output location:
```
backend/separated/htdemucs_6s/your_song/drums.mp3
backend/separated/htdemucs_6s/your_song/bass.mp3
backend/separated/htdemucs_6s/your_song/vocals.mp3
backend/separated/htdemucs_6s/your_song/guitar.mp3
backend/separated/htdemucs_6s/your_song/piano.mp3
backend/separated/htdemucs_6s/your_song/other.mp3
```

---

## Running scripts

### Full transcription pipeline — separation + transcription + fret mapping
```bash
python3 transcribe.py
```

### Basic Pitch directly on a clean isolated file
```bash
python3 -m basic_pitch output your_file.mp3
```

### Stem separation script
```bash
python3 separate.py
```

### Hand position mapper test
```bash
python3 mapper.py
```

### FastAPI dev server
```bash
uvicorn main:app --reload
```

---

## Installing packages

```bash
pip install basic-pitch
pip install demucs
pip install pydub
pip install fastapi uvicorn python-multipart
```

### Save dependencies after any new install
```bash
pip freeze > requirements.txt
```

### Install all dependencies from scratch on a new machine
```bash
pip install -r requirements.txt
```

---

## Important notes for this machine

| Rule | Reason |
|---|---|
| Always use `python3` never `python` | Mac points `python` to wrong version |
| Always use `-n htdemucs_6s` | Default model has no dedicated guitar stem |
| Always use `--mp3` with Demucs | Avoids torchcodec save error |
| Always activate venv first | Without it packages won't be found |
| Use `python3.11` to create new venvs | Basic Pitch incompatible with 3.13 |

---

## Creating a fresh venv (if you ever need to rebuild)

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
