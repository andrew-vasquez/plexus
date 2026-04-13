import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileMusic,
  LoaderCircle,
  Music2,
  Upload,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type UploadPhase } from "@/lib/demo-data";
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
  selectedFileName: string | null;
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
    stemMode: "none" | "guitar_only" | "no_guitar";
  };
  onControlChange: (
    key: "bpm" | "tuning" | "capo" | "mode" | "timeSignature" | "stemMode",
    value: string,
  ) => void;
  onChooseFile: () => void;
  onStartProcessing: () => void;
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
  stem_mode: "none" | "guitar_only" | "no_guitar";
  time_signature: string;
  artifacts: {
    midi: BackendArtifact | null;
    gp5: BackendArtifact | null;
    stem: BackendArtifact | null;
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
        <p className="type-label text-white/42">What you get back</p>
        <p className="mt-4 text-base leading-relaxed text-white/64">
          Every run can return MIDI and GP5 exports, plus an optional stem
          separation download when you need either the isolated guitar or the
          backing without guitar.
        </p>
      </div>
      <div className={`${studioInsetCardClass} min-w-0 p-5`}>
        <p className="type-label text-white/42">Best results</p>
        <ul className="mt-4 space-y-3 text-base text-white/64">
          <li>Use a clean single-guitar take when possible</li>
          <li>Set tuning and mode before uploading</li>
          <li>Use stem split only when you need an extra download</li>
        </ul>
      </div>
    </div>
  );
}

export function StudioLeftRail({ phaseSteps }: StudioLeftRailProps) {
  return (
    <aside className={`${studioRailClass} h-full min-w-0 p-5`}>
      <div className={`${studioInsetCardClass} p-5`}>
        <p className="type-label text-white/42">Workflow</p>
        <p className="mt-4 text-[1.9rem] leading-[0.95] tracking-[-0.06em] text-white sm:text-[2rem]">
          Track the upload from intake to export.
        </p>
        <p className="mt-3 text-base leading-relaxed text-white/60">
          The left rail stays focused on job progress so the center column can
          stay dedicated to the file, settings, and results.
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
  selectedFileName,
  progressState,
  controls,
  onControlChange,
  onChooseFile,
  onStartProcessing,
}: StudioUploadPanelProps) {
  const isProcessing = phase === "uploading" || phase === "processing";

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
                Pick one clean take, confirm the settings you want, then start the
                run when you are ready.
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
                Plexus runs the upload through the transcription pipeline and
                can also return a stem split from the same pass so you can
                download everything from one place.
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

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 min-[1350px]:grid-cols-3 min-[1680px]:grid-cols-6">
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

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="type-label text-white/42">Stem split</span>
                  <select
                    className="h-11 rounded-[12px] border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                    value={controls.stemMode}
                    onChange={(event) =>
                      onControlChange("stemMode", event.target.value)
                    }
                  >
                    <option value="none">None</option>
                    <option value="guitar_only">Guitar only</option>
                    <option value="no_guitar">No guitar</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6 border-t border-white/8 pt-6 min-[1700px]:border-l min-[1700px]:border-t-0 min-[1700px]:pl-8 min-[1700px]:pt-0">
              <div className="min-w-0">
                <p className="type-label text-white/42">Upload action</p>
                <div className="mt-4 space-y-3">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={onChooseFile}
                    disabled={isProcessing}
                  >
                    <Upload className="mr-2 size-4" />
                    {selectedFileName ? "Choose different file" : "Choose audio file"}
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full justify-center"
                    onClick={onStartProcessing}
                    disabled={!selectedFileName || isProcessing}
                  >
                    {isProcessing ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 size-4" />
                    )}
                    {isProcessing ? "Processing" : "Start processing"}
                  </Button>
                </div>

                <div className="mt-4 rounded-[14px] border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-white/68">
                  <p className="type-label text-white/38">Selected file</p>
                  <p className="mt-2 break-words text-white/82">
                    {selectedFileName ?? "No file selected yet."}
                  </p>
                </div>
              </div>

              <p className="text-base leading-relaxed text-white/46">
                Real backend pipeline. Optional stem export bundled into the
                same run.
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
  const currentTitle = lastUploadedFile ?? "No upload yet";

  return (
    <aside className={`${studioRailClass} h-full min-w-0 p-5`}>
      <p className="type-label text-white/42">Workspace output</p>
      <h2 className="mt-4 break-words text-[2.1rem] tracking-[-0.06em] text-white">
        {currentTitle}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-white/60">
        Downloads and the latest backend summary stay here so the main workspace
        can focus on the upload flow.
      </p>

      <div className="mt-6 space-y-4">
        <div className={`${studioInsetCardClass} p-5`}>
          <div className="flex items-start gap-4">
            <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
              <Music2 className="size-5 text-white/82" />
            </div>
            <div className="min-w-0">
              <p className="text-xl tracking-[-0.03em] text-white">Upload status</p>
              <p className="mt-2 break-words text-base leading-relaxed text-white/60">
                {phase === "idle"
                  ? "Waiting for a file."
                  : phase === "ready"
                    ? "Exports are ready to download."
                    : phase === "error"
                      ? "The latest run needs another try."
                      : "The backend is working through your file."}
              </p>
            </div>
          </div>
        </div>

        <div className={`${studioInsetCardClass} p-5`}>
          <div className="flex items-start gap-4">
            <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
              <FileMusic className="size-5 text-white/82" />
            </div>
            <div className="min-w-0">
              <p className="text-xl tracking-[-0.03em] text-white">Export set</p>
              <p className="mt-2 break-words text-base leading-relaxed text-white/60">
                {backendResult
                  ? backendResult.artifacts.stem
                    ? "MIDI, GP5, and stem separation are ready in one batch."
                    : "MIDI and GP5 are ready from the latest upload."
                  : "Once processing finishes, your downloadable files show up here."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${studioInsetCardClass} mt-6 p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-label text-white/42">Latest backend result</p>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              {backendResult
                ? `${backendResult.note_count} playable notes in ${backendResult.mode} mode at ${Math.round(
                    backendResult.bpm,
                  )} BPM. ${backendResult.tuning} tuning${backendResult.capo ? ` with capo ${backendResult.capo}` : ""}.${
                    backendResult.artifacts.stem
                      ? ` ${backendResult.stem_mode === "guitar_only" ? "Guitar-only" : "No-guitar"} stem export is ready.`
                      : ""
                  }`
                : "Upload a file to verify the real backend response without leaving the demo shell."}
            </p>
          </div>
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

            {backendResult.artifacts.stem ? (
              <Button
                asChild
                variant="subtle"
                size="lg"
                className="w-full justify-between hover:translate-y-0"
              >
                <a
                  href={`${apiBaseUrl}${backendResult.artifacts.stem.download_url}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download {backendResult.stem_mode === "guitar_only" ? "guitar-only" : "no-guitar"} stem
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={`${studioInsetCardClass} mt-6 p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-label text-white/42">Recent uploads</p>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Keep a quick view of the latest files sent through this workspace.
            </p>
          </div>
        </div>

        {recentUploads.length > 0 ? (
          <div className="mt-5 space-y-3">
            {recentUploads.slice(0, 3).map((upload, index) => (
              <div
                key={upload}
                className="rounded-[16px] border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/76 transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/14 hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 break-words leading-relaxed">{upload}</span>
                  <span className="type-label shrink-0 text-white/32">
                    {index === 0 ? "Latest" : "Earlier"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-white/42">
            Nothing has been uploaded in this session yet.
          </p>
        )}
      </div>
    </aside>
  );
}
