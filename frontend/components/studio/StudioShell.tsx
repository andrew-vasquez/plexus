"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Clock3,
  FileUp,
  Gauge,
  ListFilter,
  LoaderCircle,
  Upload,
  Waves,
} from "lucide-react";
import { ActionLink } from "@/components/shared/ActionLink";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { Button } from "@/components/ui/button";
import { demoSession, studioSignals, type UploadPhase } from "@/lib/demo-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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
    <main className="relative min-h-screen overflow-hidden px-6 py-8 lg:px-10">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <PlexusLogo />
          <div className="flex flex-wrap items-center gap-3">
            <ActionLink href="/" variant="ghost">
              Back to landing
            </ActionLink>
            <ActionLink href="/studio/demo" variant="secondary">
              View demo workspace
            </ActionLink>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="surface-panel p-5">
            <p className="type-label text-[var(--color-accent)]">Navigation</p>
            <div className="mt-6 space-y-3">
              {[
                { label: "Upload queue", state: "Active" },
                { label: "Sessions", state: "2 ready" },
                { label: "Exports", state: "Preview" },
                { label: "Player beta", state: "Phase 2" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {item.state}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          <section className="surface-panel p-6 lg:p-8">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="type-label text-[var(--color-accent)]">
                  Plexus studio
                </p>
                <h1 className="mt-3 type-display text-4xl tracking-[-0.04em] text-white sm:text-5xl">
                  Drop a take and move it into the tab workspace.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
                  This MVP keeps the upload real, then hands you off into a
                  designed review flow with clean status messaging and a
                  ready-made demo transcription.
                </p>
              </div>
              <div className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/75">
                API target: {API_BASE_URL}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="sm" type="button" onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload source
              </Button>
              <Button disabled size="sm" type="button" variant="outline">
                <FileUp className="h-4 w-4" />
                Guitar Pro import later
              </Button>
            </div>

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

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[18px] border border-dashed border-white/12 bg-black/30 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="type-label text-[var(--color-accent)]">
                      Upload intake
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      Audio first. Review fast.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
                      Use a clean file handoff here, then move directly into the
                      review workspace once Plexus confirms receipt.
                    </p>
                  </div>
                  <span className="inline-flex size-12 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.03]">
                    <AudioLines className="h-5 w-5 text-[var(--color-accent)]" />
                  </span>
                </div>

                <div className="mt-6 rounded-[16px] border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-white/14 hover:bg-white/[0.045]">
                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <p className="text-xl font-medium tracking-[-0.02em] text-white">
                        Drop WAV, MP3, or memo audio
                      </p>
                      <p className="max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
                        The backend confirms receipt. Plexus then stages a mock
                        analysis path into the demo workspace so the next step
                        feels immediate.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["WAV", "MP3", "Phone memo", "Single take"].map((item) => (
                        <span
                          key={item}
                          className="rounded-[10px] border border-white/10 bg-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/52"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button type="button" onClick={() => inputRef.current?.click()}>
                        <Upload className="h-4 w-4" />
                        Choose audio file
                      </Button>
                      <p className="text-sm text-white/40">
                        Demo handoff only. No local processing yet.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[14px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    {phase === "uploading" || phase === "processing" ? (
                      <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
                    ) : phase === "ready" ? (
                      <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)]" />
                    ) : phase === "error" ? (
                      <Clock3 className="h-5 w-5 text-[var(--color-amber)]" />
                    ) : (
                      <Waves className="h-5 w-5 text-[var(--color-accent)]" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">Status signal</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {statusMessage}
                      </p>
                    </div>
                  </div>
                  {errorMessage ? (
                    <p className="mt-4 text-sm text-[var(--color-amber)]" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3">
                  {phaseSteps.map((step) => (
                    <div
                      key={step.label}
                      className="rounded-[12px] border border-white/7 bg-black/25 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-white">{step.label}</p>
                        <span
                          className={`rounded-[10px] px-3 py-2 text-[11px] uppercase tracking-[0.18em] ${
                            step.complete
                              ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                              : step.active
                                ? "bg-white/10 text-white"
                                : "bg-white/[0.04] text-white/45"
                          }`}
                        >
                          {step.complete ? "Done" : step.active ? "Live" : "Standby"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-6">
                  <p className="type-label text-[var(--color-amber)]">
                    Recent signal
                  </p>
                  <div className="mt-5 space-y-3">
                    {recentUploads.map((upload) => (
                      <div
                        key={upload}
                        className="rounded-[12px] border border-white/7 bg-black/25 px-4 py-4"
                      >
                        <p className="text-sm text-white">{upload}</p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          Ready for section mapping and workspace review
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/8 bg-black/35 p-6">
                  <p className="type-label text-[var(--color-accent)]">
                    Demo workspace handoff
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">
                    {lastUploadedFile ?? demoSession.title}
                  </h2>
                  <div className="mt-5 grid gap-3">
                    {studioSignals.map((signal) => (
                      <div
                        key={signal.label}
                        className="flex items-center gap-4 rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4"
                      >
                        <signal.icon className="h-5 w-5 text-[var(--color-accent)]" />
                        <div>
                          <p className="text-sm text-white">{signal.label}</p>
                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {signal.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button
                      asChild
                      className="w-full"
                      variant={phase === "ready" ? "default" : "outline"}
                    >
                      <Link href="/studio/demo">
                        Open demo transcription
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="surface-panel p-5">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-[var(--color-accent)]" />
              <div>
                <p className="type-label text-[var(--color-accent)]">
                  Review signal
                </p>
                <p className="mt-1 text-sm text-white">{demoSession.confidence}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                `${demoSession.detectedTempo} tracking`,
                `${demoSession.tuning} tuning pass`,
                "Loop and speed controls staged",
                "Export cards ready for GP / PDF / MIDI",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4 text-sm text-white/82"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[12px] border border-white/7 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <ListFilter className="h-4 w-4 text-[var(--color-accent)]" />
                <p className="text-sm text-white">Current scope</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Audio upload is real. Results, tab rendering, and player behavior
                are high-fidelity UI states designed to carry the MVP visually.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
