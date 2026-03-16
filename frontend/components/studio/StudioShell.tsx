"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gauge,
  LoaderCircle,
  Upload,
  Waves,
} from "lucide-react";
import { ActionLink } from "@/components/shared/ActionLink";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { demoSession, studioSignals, type UploadPhase } from "@/lib/demo-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type UploadResponse = {
  filename: string;
  message: string;
};

const panelClass =
  "motion-surface rounded-[18px] border border-white/8 bg-white/[0.03] p-5 hover:border-white/14 hover:bg-white/[0.04]";

const railClass =
  "motion-surface rounded-[18px] border border-white/8 bg-black/30 p-5 hover:border-white/14 hover:bg-black/35";

const insetCardClass =
  "motion-surface-soft rounded-[12px] border border-white/7 bg-black/25 px-4 py-4 hover:border-white/12 hover:bg-black/35";

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
        <AnimatedGroup
          animateOnMount
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <PlexusLogo />
          <div className="flex flex-wrap items-center gap-3">
            <ActionLink href="/" variant="ghost">
              Back to landing
            </ActionLink>
            <ActionLink href="/studio/demo" variant="secondary">
              View demo workspace
            </ActionLink>
          </div>
        </AnimatedGroup>

        <AnimatedGroup animateOnMount className="surface-panel p-6 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="type-label text-[var(--color-accent)]">Plexus studio</p>
              <h1 className="mt-3 type-display text-4xl tracking-[-0.04em] text-white sm:text-5xl">
                Drop a take and move it into the tab workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
                This MVP keeps the upload real, then hands you off into a designed
                review flow with clean status messaging and a ready-made demo transcription.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "API target", value: "localhost:8000" },
                { label: "Upload mode", value: phase === "idle" ? "Ready" : phase },
                { label: "Workspace", value: "Demo handoff" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="motion-surface-soft rounded-[14px] border border-white/7 bg-white/[0.03] px-4 py-4 hover:border-white/14 hover:bg-white/[0.04]"
                >
                  <p className="type-label text-[var(--color-accent)]">{stat.label}</p>
                  <p className="mt-2 text-sm text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
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

            <aside className="space-y-6">
              <div className={railClass}>
                <p className="type-label text-[var(--color-accent)]">Pinned session</p>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {demoSession.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  {demoSession.detectedTempo} • {demoSession.tuning} • review-ready
                </p>
              </div>

              <div className={railClass}>
                <p className="type-label text-[var(--color-accent)]">Signal chain</p>
                <div className="mt-5 space-y-3">
                  {phaseSteps.map((step, index) => (
                    <div
                      key={step.label}
                      className={`rounded-[12px] border px-4 py-4 ${
                        step.active
                          ? "border-white/18 bg-white/[0.07]"
                          : "border-white/7 bg-white/[0.03]"
                      } motion-surface-soft hover:border-white/14`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-white">{step.label}</p>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                          {step.complete ? "Done" : step.active ? "Live" : `0${index + 1}`}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
                        {index === 0
                          ? "Ingest and confirm the source file."
                          : index === 1
                            ? "Map tempo, tuning, and sections."
                            : "Route into the browser review surface."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className={`${panelClass} lg:p-6`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="type-label text-[var(--color-accent)]">Upload intake</p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    One clear upload surface, then a direct handoff into the demo review workspace.
                  </p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/75">
                  Mono input
                </div>
              </div>

              <div className="mt-6 rounded-[16px] border border-dashed border-white/12 bg-black/30 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl tracking-[-0.05em] text-white">
                      Audio first. Review fast.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
                      Use a clean file handoff here, then move directly into the review
                      workspace once Plexus confirms receipt.
                    </p>
                  </div>
                  <div className="flex h-10 items-end gap-2" aria-hidden="true">
                    {[12, 22, 34, 20, 30, 18].map((height, index) => (
                      <span
                        key={index}
                        className="w-[5px] rounded-full bg-white/90"
                        style={{ height }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["WAV", "MP3", "Phone memo", "Single take"].map((item) => (
                    <span
                      key={item}
                      className="rounded-[10px] border border-white/10 bg-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/52"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-6 border-t border-white/8 pt-5">
                  <Button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4" />
                    Choose audio file
                  </Button>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">
                    Demo handoff only. No local processing yet.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
                <div className="motion-surface rounded-[14px] border border-white/8 bg-black/25 p-5 hover:border-white/14 hover:bg-black/32">
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

                <div className="grid gap-4">
                  <div className={insetCardClass}>
                    <p className="type-label text-[var(--color-accent)]">Session target</p>
                    <p className="mt-3 text-sm text-white">Browser review workspace</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                      The next surface stays focused on sections, timing, and playable tab structure.
                    </p>
                  </div>
                  <div className={insetCardClass}>
                    <p className="type-label text-[var(--color-accent)]">Expected outputs</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["GP5", "PDF", "MIDI"].map((item) => (
                        <span
                          key={item}
                          className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/62"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className={railClass}>
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <p className="type-label text-[var(--color-accent)]">Review signal</p>
                    <p className="mt-1 text-sm text-white">{demoSession.confidence}</p>
                  </div>
                </div>
              </div>

              <div className={panelClass}>
                <p className="type-label text-[var(--color-accent)]">Demo workspace handoff</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {lastUploadedFile ?? demoSession.title}
                </h2>
                <div className="mt-5 space-y-3">
                  {studioSignals.map((signal) => (
                    <div key={signal.label} className={insetCardClass}>
                      <div className="flex items-center gap-3">
                        <signal.icon className="h-5 w-5 text-[var(--color-accent)]" />
                        <div>
                          <p className="text-sm text-white">{signal.label}</p>
                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {signal.value}
                          </p>
                        </div>
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

              <div className={panelClass}>
                <p className="type-label text-[var(--color-accent)]">Recent signal</p>
                <div className="mt-5 space-y-3">
                  {recentUploads.map((upload) => (
                    <div
                      key={upload}
                      className="motion-surface-soft rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4 hover:border-white/12 hover:bg-white/[0.05]"
                    >
                      <p className="text-sm text-white">{upload}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Ready for section mapping and workspace review
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={railClass}>
                <p className="type-label text-[var(--color-accent)]">Current scope</p>
                <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  Audio upload is real. Results, tab rendering, and player behavior are
                  high-fidelity UI states designed to carry the MVP visually.
                </p>
              </div>
            </aside>
          </div>
        </AnimatedGroup>
      </div>
    </main>
  );
}
