import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gauge,
  LoaderCircle,
  Upload,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoSession, studioSignals, type UploadPhase } from "@/lib/demo-data";
import {
  studioInsetCardClass,
  studioRailClass,
} from "@/components/studio/shared";

type StudioLeftRailProps = {
  phaseSteps: { label: string; active: boolean; complete: boolean }[];
};

type StudioUploadPanelProps = {
  phase: UploadPhase;
  statusMessage: string;
  errorMessage: string;
  progressState: {
    jobId: string;
    status: string;
    progress: number;
    message: string;
  } | null;
  controls: {
    bpm: string;
    tuning: string;
    capo: string;
    mode: string;
    timeSignature: string;
  };
  onControlChange: (
    key: "bpm" | "tuning" | "capo" | "mode" | "timeSignature",
    value: string,
  ) => void;
  onChooseFile: () => void;
};

type BackendArtifact = {
  artifact_id: string;
  filename: string;
  content_type: string;
  download_url: string;
};

type BackendResult = {
  source_filename: string;
  note_count: number;
  bpm: number;
  tuning: string;
  capo: number;
  mode: string;
  time_signature: string;
  artifacts: {
    midi: BackendArtifact | null;
    gp5: BackendArtifact | null;
  };
};

type StudioRightRailProps = {
  phase: UploadPhase;
  lastUploadedFile: string | null;
  recentUploads: string[];
  backendResult: BackendResult | null;
  apiBaseUrl: string;
};

function SignalCard({
  label,
  active,
  complete,
}: {
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div
      className={`${studioInsetCardClass} flex flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        active ? "border-[var(--color-accent)]/30 bg-white/[0.04]" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-lg leading-tight tracking-[-0.03em] text-white">
          {label}
        </p>
        <p className="mt-1 text-sm text-white/44">
          {complete ? "Complete" : active ? "Live" : "Standby"}
        </p>
      </div>
      <span className="type-label shrink-0 rounded-[12px] border border-white/8 bg-white/[0.03] px-3 py-2 text-white/42">
        {complete ? "Done" : active ? "Live" : "Standby"}
      </span>
    </div>
  );
}

function UploadStatusCard({
  phase,
  statusMessage,
  errorMessage,
  progressState,
}: {
  phase: UploadPhase;
  statusMessage: string;
  errorMessage: string;
  progressState: StudioUploadPanelProps["progressState"];
}) {
  const isActive = phase === "uploading" || phase === "processing";

  return (
    <div className={`${studioInsetCardClass} p-5`}>
      <div className="flex items-start gap-4">
        <div className="mt-0.5 rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
          {phase === "ready" ? (
            <CheckCircle2 className="size-5 text-[var(--color-accent)]" />
          ) : isActive ? (
            <LoaderCircle className="size-5 animate-spin text-[var(--color-accent)]" />
          ) : phase === "error" ? (
            <Clock3 className="size-5 text-white/64" />
          ) : (
            <Waves className="size-5 text-white/82" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xl tracking-[-0.03em] text-white">
            {phase === "idle"
              ? "Status signal"
              : phase === "ready"
                ? "Ready to review"
                : phase === "error"
                  ? "Upload issue"
                  : "Signal in motion"}
          </p>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-white/60">
            {errorMessage || statusMessage}
          </p>
          {progressState ? (
            <div className="mt-4 max-w-xl">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/40">
                <span>{progressState.status.replaceAll("_", " ")}</span>
                <span>{progressState.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-500 ease-out"
                  style={{ width: `${progressState.progress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StudioScopeCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={`${studioInsetCardClass} min-w-0 p-5`}>
        <p className="type-label text-white/42">Current scope</p>
        <p className="mt-4 text-base leading-relaxed text-white/64">
          Audio upload now hits the real transcription backend. The review
          workspace and player flow remain demo-first while the pipeline is
          being proven.
        </p>
      </div>
      <div className={`${studioInsetCardClass} min-w-0 p-5`}>
        <p className="type-label text-white/42">Next layer</p>
        <ul className="mt-4 space-y-3 text-base text-white/64">
          <li>Custom browser-side GP5 player</li>
          <li>Measure sync and loop points</li>
          <li>Direct review from backend output</li>
        </ul>
      </div>
    </div>
  );
}

export function StudioLeftRail({ phaseSteps }: StudioLeftRailProps) {
  return (
    <aside className={`${studioRailClass} h-full min-w-0 p-5`}>
      <div className={`${studioInsetCardClass} p-5`}>
        <p className="type-label text-white/42">Pinned session</p>
        <p className="mt-4 text-[1.9rem] leading-[0.95] tracking-[-0.06em] text-white sm:text-[2rem]">
          {demoSession.title}
        </p>
        <p className="mt-3 text-base leading-relaxed text-white/60">
          {demoSession.detectedTempo} • {demoSession.tuning} • review-ready
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {phaseSteps.map((step) => (
          <SignalCard
            key={step.label}
            label={step.label}
            active={step.active}
            complete={step.complete}
          />
        ))}
      </div>
    </aside>
  );
}

export function StudioUploadPanel({
  phase,
  statusMessage,
  errorMessage,
  progressState,
  controls,
  onControlChange,
  onChooseFile,
}: StudioUploadPanelProps) {
  return (
    <section className="min-w-0 space-y-6">
      <div className={`${studioRailClass} min-w-0 p-6`}>
        <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-xl">
            <p className="type-label text-[var(--color-accent)]">Upload intake</p>
            <h2 className="mt-4 max-w-lg text-4xl tracking-[-0.06em] text-white">
              Audio first. Review fast.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/62">
              Bring in one clean take, let Plexus confirm the handoff, then step
              directly into the structured review workspace.
            </p>
          </div>

          <div className={`${studioInsetCardClass} min-w-0 xl:w-[200px] p-5`}>
            <p className="type-label text-white/42">Signal view</p>
            <p className="mt-3 text-2xl tracking-[-0.04em] text-white">Mono input</p>
            <div className="mt-6 flex h-12 items-end gap-2">
              {[0.26, 0.56, 0.86, 0.48, 0.76, 0.34].map((height, index) => (
                <span
                  key={index}
                  className="w-1.5 flex-1 rounded-full bg-white/82"
                  style={{ height: `${height * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`${studioInsetCardClass} mt-8 min-w-0 p-6`}>
          <div className="grid min-w-0 gap-6 min-[1700px]:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
            <div className="min-w-0">
              <h3 className="max-w-md text-[2rem] leading-[1.06] tracking-[-0.05em] text-white">
                Drop WAV, MP3, or memo audio
              </h3>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/60">
                Plexus sends the file through the real backend pipeline, then
                keeps the review experience inside the demo shell while the
                custom player is still being built.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {["WAV", "MP3", "Phone memo", "Single take"].map((item) => (
                  <span
                    key={item}
                    className="type-label rounded-[12px] border border-white/8 bg-white/[0.02] px-4 py-3 text-center text-white/46"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 min-[1350px]:grid-cols-3 min-[1680px]:grid-cols-5">
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="type-label text-white/42">Mode</span>
                  <select
                    className="h-11 rounded-[12px] border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                    value={controls.mode}
                    onChange={(event) =>
                      onControlChange("mode", event.target.value)
                    }
                  >
                    <option value="riff">Riff</option>
                    <option value="lead">Lead</option>
                    <option value="rhythm">Rhythm</option>
                  </select>
                </label>

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="type-label text-white/42">Tuning</span>
                  <select
                    className="h-11 rounded-[12px] border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                    value={controls.tuning}
                    onChange={(event) =>
                      onControlChange("tuning", event.target.value)
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="drop_d">Drop D</option>
                    <option value="half_step_down">Half-step down</option>
                  </select>
                </label>

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="type-label text-white/42">BPM</span>
                  <input
                    className="h-11 rounded-[12px] border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/28"
                    inputMode="numeric"
                    placeholder="Auto"
                    value={controls.bpm}
                    onChange={(event) =>
                      onControlChange("bpm", event.target.value)
                    }
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="type-label text-white/42">Capo</span>
                  <input
                    className="h-11 rounded-[12px] border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                    inputMode="numeric"
                    value={controls.capo}
                    onChange={(event) =>
                      onControlChange("capo", event.target.value)
                    }
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="type-label text-white/42">Time</span>
                  <select
                    className="h-11 rounded-[12px] border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                    value={controls.timeSignature}
                    onChange={(event) =>
                      onControlChange("timeSignature", event.target.value)
                    }
                  >
                    <option value="4/4">4/4</option>
                    <option value="3/4">3/4</option>
                    <option value="6/8">6/8</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6 border-t border-white/8 pt-6 min-[1700px]:border-l min-[1700px]:border-t-0 min-[1700px]:pl-8 min-[1700px]:pt-0">
              <div className="min-w-0">
                <p className="type-label text-white/42">Upload action</p>
                <Button
                  type="button"
                  size="lg"
                  className="mt-4 w-full justify-center"
                  onClick={onChooseFile}
                >
                  <Upload className="mr-2 size-4" />
                  Choose audio file
                </Button>
              </div>

              <p className="text-base leading-relaxed text-white/46">
                Real backend pipeline. Demo review shell.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UploadStatusCard
        phase={phase}
        statusMessage={statusMessage}
        errorMessage={errorMessage}
        progressState={progressState}
      />

      <StudioScopeCards />
    </section>
  );
}

export function StudioRightRail({
  phase,
  lastUploadedFile,
  recentUploads,
  backendResult,
  apiBaseUrl,
}: StudioRightRailProps) {
  const handoffTitle =
    phase === "ready" ? lastUploadedFile ?? demoSession.title : demoSession.title;

  return (
    <aside className={`${studioRailClass} h-full min-w-0 p-5`}>
      <p className="type-label text-white/42">Demo workspace handoff</p>
      <h2 className="mt-4 break-words text-[2.1rem] tracking-[-0.06em] text-white">
        {handoffTitle}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-white/60">
        The right rail stays focused on where the uploaded take is headed next,
        instead of duplicating the whole studio again.
      </p>

      <div className="mt-6 space-y-4">
        {studioSignals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div key={signal.label} className={`${studioInsetCardClass} p-5`}>
              <div className="flex items-start gap-4">
                <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
                  <Icon className="size-5 text-white/82" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl tracking-[-0.03em] text-white">
                    {signal.label}
                  </p>
                  <p className="mt-2 break-words text-base leading-relaxed text-white/60">
                    {signal.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${studioInsetCardClass} mt-6 p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-label text-white/42">Latest backend result</p>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              {backendResult
                ? `${backendResult.note_count} playable notes in ${backendResult.mode} mode at ${Math.round(
                    backendResult.bpm,
                  )} BPM. ${backendResult.tuning} tuning${backendResult.capo ? ` with capo ${backendResult.capo}` : ""}.`
                : "Upload a file to verify the real backend response without leaving the demo shell."}
            </p>
          </div>
          <Gauge className="mt-0.5 size-5 shrink-0 text-white/44" />
        </div>

        {backendResult ? (
          <div className="mt-5 space-y-3">
            {backendResult.artifacts.midi ? (
              <Button
                asChild
                variant="subtle"
                size="lg"
                className="w-full justify-between hover:translate-y-0"
              >
                <a
                  href={`${apiBaseUrl}${backendResult.artifacts.midi.download_url}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download MIDI
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            ) : null}

            {backendResult.artifacts.gp5 ? (
              <Button
                asChild
                variant="subtle"
                size="lg"
                className="w-full justify-between hover:translate-y-0"
              >
                <a
                  href={`${apiBaseUrl}${backendResult.artifacts.gp5.download_url}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download GP5
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={`${studioInsetCardClass} mt-6 p-5`}>
        <p className="type-label text-white/42">Preview sections</p>
        <div className="mt-5 space-y-4">
          {demoSession.sections.map((section) => (
            <div
              key={section.name}
              className="flex items-start justify-between gap-4 text-base text-white/78"
            >
              <div className="min-w-0">
                <p className="text-lg text-white">{section.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/46">
                  {section.note}
                </p>
              </div>
              <span className="type-label shrink-0 text-white/38">
                {section.measures}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${studioInsetCardClass} mt-6 p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-label text-white/42">Recent signal</p>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              The latest uploaded files stay visible here so the studio always
              reads like a working product, not a static mockup.
            </p>
          </div>
          <Gauge className="mt-0.5 size-5 shrink-0 text-white/44" />
        </div>

        <div className="mt-5 space-y-3">
          {recentUploads.slice(0, 3).map((upload, index) => (
            <div
              key={upload}
              className="rounded-[16px] border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/76 transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/14 hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 break-words leading-relaxed">{upload}</span>
                <span className="type-label shrink-0 text-white/32">
                  {index === 0 ? "Latest" : "Queued"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="mt-6 w-full hover:translate-y-0"
      >
        <Link to="/studio/demo">
          Open demo transcription
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </aside>
  );
}
