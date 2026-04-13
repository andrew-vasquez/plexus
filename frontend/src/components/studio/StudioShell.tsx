import { useEffect, useMemo, useRef, useState } from "react";
import { ActionLink } from "@/components/shared/ActionLink";
import { type UploadPhase } from "@/lib/demo-data";
import { apiBaseUrl, apiTargetLabel } from "@/lib/env";
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

type BackendArtifact = {
  artifact_id: string;
  filename: string;
  content_type: string;
  download_url: string;
};

type TranscriptionResponse = {
  job_id: string;
  source_filename: string;
  content_type: string;
  bpm: number;
  tuning: string;
  capo: number;
  mode: string;
  time_signature: string;
  note_count: number;
  note_preview_count: number;
  note_events: {
    start_s: number;
    end_s: number;
    pitch_midi: number;
    amplitude: number;
    string_number?: number | null;
    fret?: number | null;
  }[];
  artifacts: {
    midi: BackendArtifact | null;
    gp5: BackendArtifact | null;
  };
};

type TranscriptionJobQueuedResponse = {
  job_id: string;
  status: string;
  progress: number;
  message: string;
};

type TranscriptionJobStatusResponse = {
  job_id: string;
  status: string;
  progress: number;
  message: string;
  error: string | null;
  result: TranscriptionResponse | null;
};

type ProgressState = {
  jobId: string;
  status: string;
  progress: number;
  message: string;
};

type TranscriptionControls = {
  bpm: string;
  tuning: string;
  capo: string;
  mode: string;
  timeSignature: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function mapStatusToPhase(status: string): UploadPhase {
  if (status === "queued" || status === "isolating") {
    return "uploading";
  }
  if (
    status === "transcribing" ||
    status === "post_processing" ||
    status === "exporting"
  ) {
    return "processing";
  }
  if (status === "done") {
    return "ready";
  }
  if (status === "failed") {
    return "error";
  }
  return "idle";
}

export function StudioShell() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Drop an audio file to start the signal chain.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const [backendResult, setBackendResult] = useState<TranscriptionResponse | null>(
    null,
  );
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [controls, setControls] = useState<TranscriptionControls>({
    bpm: "",
    tuning: "standard",
    capo: "0",
    mode: "riff",
    timeSignature: "4/4",
  });
  const [recentUploads, setRecentUploads] = useState<string[]>([
    "Velvet Lights - demo stem.wav",
    "Bridge motif memo.mp3",
  ]);

  const phaseSteps = useMemo(
    () => [
      {
        label: "Signal intake",
        active:
          progressState?.status === "queued" || progressState?.status === "isolating",
        complete:
          phase === "processing" || phase === "ready" || phase === "error",
      },
      {
        label: "Structure mapping",
        active:
          progressState?.status === "transcribing" ||
          progressState?.status === "post_processing",
        complete: phase === "ready" || phase === "error",
      },
      {
        label: "Artifact export",
        active: progressState?.status === "exporting",
        complete: phase === "ready",
      },
      {
        label: "Workspace handoff",
        active: phase === "ready",
        complete: phase === "ready",
      },
    ],
    [phase, progressState],
  );

  useEffect(() => {
    return () => {
      pollAbortRef.current?.abort();
    };
  }, []);

  async function pollJob(jobId: string) {
    pollAbortRef.current?.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;

    while (!controller.signal.aborted) {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/transcribe/${jobId}/status`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        let detail = "Failed to fetch transcription status.";
        try {
          const payload = (await response.json()) as { detail?: string };
          detail = payload.detail ?? detail;
        } catch {
          // Keep default detail.
        }
        throw new Error(detail);
      }

      const data = (await response.json()) as TranscriptionJobStatusResponse;
      setProgressState({
        jobId: data.job_id,
        status: data.status,
        progress: data.progress,
        message: data.message,
      });
      setPhase(mapStatusToPhase(data.status));
      setStatusMessage(data.message);

      if (data.status === "done" && data.result) {
        const result = data.result;
        await sleep(150);
        setBackendResult(result);
        setLastUploadedFile(result.source_filename);
        setStatusMessage(
          `${result.note_count} playable notes mapped for ${result.tuning} at ${Math.round(
            result.bpm,
          )} BPM. MIDI and GP5 artifacts are ready.`,
        );
        setRecentUploads((previous) =>
          [result.source_filename, ...previous].slice(0, 4),
        );
        return;
      }

      if (data.status === "failed") {
        throw new Error(data.error || "Transcription failed.");
      }

      await sleep(1000);
    }
  }

  async function handleFile(file: File) {
    pollAbortRef.current?.abort();
    setPhase("uploading");
    setErrorMessage("");
    setBackendResult(null);
    setProgressState(null);
    setStatusMessage("Uploading the source file to Plexus.");

    const formData = new FormData();
    formData.append("file", file);
    if (controls.bpm.trim()) {
      formData.append("bpm", controls.bpm.trim());
    }
    formData.append("tuning", controls.tuning);
    formData.append("capo", controls.capo);
    formData.append("mode", controls.mode);
    formData.append("time_signature", controls.timeSignature);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let detail = "Upload request failed.";
        try {
          const payload = (await response.json()) as { detail?: string };
          detail = payload.detail ?? detail;
        } catch {
          // Keep the default message if the backend response is not JSON.
        }
        throw new Error(detail);
      }

      const queued = (await response.json()) as TranscriptionJobQueuedResponse;
      setProgressState({
        jobId: queued.job_id,
        status: queued.status,
        progress: queued.progress,
        message: queued.message,
      });
      setStatusMessage(queued.message);
      await pollJob(queued.job_id);
    } catch (error) {
      setPhase("error");
      setProgressState((current) =>
        current
          ? { ...current, status: "failed", message: error instanceof Error ? error.message : "Something went wrong." }
          : current,
      );
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
          { label: "API target", value: apiTargetLabel },
          { label: "Upload mode", value: phase === "idle" ? "Ready" : phase },
          {
            label: "Artifacts",
            value: backendResult ? "MIDI + GP5 ready" : "Waiting",
          },
          {
            label: "Mode",
            value: controls.mode,
          },
        ]}
      >
        <div className="mt-8 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)] min-[1800px]:grid-cols-[260px_minmax(0,1fr)_300px]">
          <StudioLeftRail phaseSteps={phaseSteps} />
          <StudioUploadPanel
            phase={phase}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            progressState={progressState}
            controls={controls}
            onControlChange={(key, value) => {
              setControls((current) => ({ ...current, [key]: value }));
            }}
            onChooseFile={() => inputRef.current?.click()}
          />
          <div className="xl:col-span-2 min-[1800px]:col-span-1">
            <StudioRightRail
              apiBaseUrl={apiBaseUrl}
              backendResult={backendResult}
              phase={phase}
              lastUploadedFile={lastUploadedFile}
              recentUploads={recentUploads}
            />
          </div>
        </div>
      </StudioSurface>
    </StudioPageFrame>
  );
}
