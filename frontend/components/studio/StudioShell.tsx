"use client";

import { useMemo, useRef, useState } from "react";
import { ActionLink } from "@/components/shared/ActionLink";
import { type UploadPhase } from "@/lib/demo-data";
import {
  StudioLeftRail,
  StudioRightRail,
  StudioUploadPanel,
} from "@/components/studio/studio-shell-sections";
import {
  StudioPageFrame,
  StudioSurface,
  StudioTopBar,
} from "@/components/studio/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type UploadResponse = {
  filename: string;
  message: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function StudioShell() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Drop an audio file to start the signal chain.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<string[]>([
    "Velvet Lights - demo stem.wav",
    "Bridge motif memo.mp3",
  ]);

  const phaseSteps = useMemo(
    () => [
      {
        label: "Signal intake",
        active: phase === "uploading",
        complete:
          phase === "processing" || phase === "ready" || phase === "error",
      },
      {
        label: "Structure mapping",
        active: phase === "processing",
        complete: phase === "ready" || phase === "error",
      },
      {
        label: "Workspace handoff",
        active: phase === "ready",
        complete: phase === "ready",
      },
    ],
    [phase],
  );

  async function handleFile(file: File) {
    setPhase("uploading");
    setErrorMessage("");
    setStatusMessage("Uploading the source file to Plexus.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload request failed.");
      }

      const data = (await response.json()) as UploadResponse;
      await sleep(700);
      setPhase("processing");
      setStatusMessage(
        `Mapping sections, tempo, and note density for ${data.filename}.`,
      );
      await sleep(1200);
      setPhase("ready");
      setLastUploadedFile(data.filename);
      setStatusMessage(`${data.message} Open the demo workspace to review it.`);
      setRecentUploads((previous) => [data.filename, ...previous].slice(0, 4));
    } catch (error) {
      setPhase("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setStatusMessage("We couldn't process that upload. Try a new take.");
    }
  }

  return (
    <StudioPageFrame>
      <input
        ref={inputRef}
        className="sr-only"
        accept="audio/*"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }

          event.target.value = "";
        }}
      />

      <StudioTopBar
        secondaryAction={
          <ActionLink href="/studio/demo" variant="secondary">
            View demo workspace
          </ActionLink>
        }
      />

      <StudioSurface
        eyebrow="Plexus studio"
        title="Drop a take and move it into the tab workspace."
        description="This MVP keeps the upload real, then hands you off into a designed review flow with clean status messaging and a ready-made demo transcription."
        stats={[
          { label: "API target", value: "localhost:8000" },
          { label: "Upload mode", value: phase === "idle" ? "Ready" : phase },
          { label: "Workspace", value: "Demo handoff" },
        ]}
      >
        <div className="mt-8 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <StudioLeftRail phaseSteps={phaseSteps} />
          <StudioUploadPanel
            phase={phase}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            onChooseFile={() => inputRef.current?.click()}
          />
          <StudioRightRail
            phase={phase}
            lastUploadedFile={lastUploadedFile}
            recentUploads={recentUploads}
          />
        </div>
      </StudioSurface>
    </StudioPageFrame>
  );
}
