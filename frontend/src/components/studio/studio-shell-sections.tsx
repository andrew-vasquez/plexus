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
  onChooseFile: () => void;
};

type StudioRightRailProps = {
  phase: UploadPhase;
  lastUploadedFile: string | null;
  recentUploads: string[];
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
}: {
  phase: UploadPhase;
  statusMessage: string;
  errorMessage: string;
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
          Audio upload is real. Results, tab rendering, and player behavior are
          high-fidelity UI states designed to carry the MVP visually.
        </p>
      </div>
      <div className={`${studioInsetCardClass} min-w-0 p-5`}>
        <p className="type-label text-white/42">Next layer</p>
        <ul className="mt-4 space-y-3 text-base text-white/64">
          <li>Browser-side player mount</li>
          <li>Measure sync and loop points</li>
          <li>Direct Guitar Pro import</li>
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
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <h3 className="max-w-md text-[2rem] leading-[1.06] tracking-[-0.05em] text-white">
                Drop WAV, MP3, or memo audio
              </h3>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/60">
                The backend confirms receipt. Plexus then stages a mock analysis
                path into the demo workspace so the next step feels immediate.
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
            </div>

            <div className="flex min-w-0 flex-col justify-between border-t border-white/8 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
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

              <p className="mt-5 text-base leading-relaxed text-white/46">
                Demo handoff only. No local processing yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UploadStatusCard
        phase={phase}
        statusMessage={statusMessage}
        errorMessage={errorMessage}
      />

      <StudioScopeCards />
    </section>
  );
}

export function StudioRightRail({
  phase,
  lastUploadedFile,
  recentUploads,
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
