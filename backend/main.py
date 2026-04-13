from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from core.config import settings

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - local envs may not have dotenv yet
    load_dotenv = None

if load_dotenv is not None:
    load_dotenv()

app = FastAPI(
    title=settings.app_name,
    description="AI guitar transcription with guitar isolation, MIDI output, and GP5 export.",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Plexus backend is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
