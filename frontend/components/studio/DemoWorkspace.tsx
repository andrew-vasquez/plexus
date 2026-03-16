import Link from "next/link";
import {
  ArrowLeft,
  Gauge,
  ListMusic,
  Play,
  Repeat,
  SlidersHorizontal,
  TimerReset,
} from "lucide-react";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { Button } from "@/components/ui/button";
import { demoSession } from "@/lib/demo-data";

export function DemoWorkspace() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 lg:px-10">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <PlexusLogo />
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/studio">
                <ArrowLeft className="h-4 w-4" />
                Back to studio
              </Link>
            </Button>
          </div>
        </div>

        <section className="surface-panel p-6 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="type-label text-[var(--color-accent)]">Demo workspace</p>
              <h1 className="mt-3 type-display text-4xl tracking-[-0.04em] text-white sm:text-5xl">
                {demoSession.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
                {demoSession.artist} • {demoSession.detectedTempo} •{" "}
                {demoSession.tuning} • {demoSession.duration}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Confidence", value: demoSession.confidence },
                { label: "Sections", value: `${demoSession.sections.length} mapped` },
                { label: "Exports", value: "GP5 / PDF / MIDI" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4"
                >
                  <p className="type-label text-[var(--color-accent)]">{stat.label}</p>
                  <p className="mt-2 text-sm text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
            <aside className="rounded-[18px] border border-white/8 bg-black/30 p-5">
              <p className="type-label text-[var(--color-accent)]">Sections</p>
              <div className="mt-5 space-y-3">
                {demoSession.sections.map((section) => (
                  <div
                    key={section.name}
                    className="rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-sm text-white">{section.name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {section.measures}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
                      {section.note}
                    </p>
                  </div>
                ))}
              </div>
            </aside>

            <section className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5 lg:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="type-label text-[var(--color-accent)]">Tab viewer</p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    Phase 1 uses a custom Plexus renderer built from seeded score
                    data instead of a real Guitar Pro engine.
                  </p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/75">
                  Browser review
                </div>
              </div>

              <div className="tab-grid mt-6">
                {demoSession.measures.map((measure) => (
                  <article
                    key={measure.number}
                    className="rounded-[16px] border border-white/8 bg-black/30 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="type-label text-[var(--color-accent)]">
                          Measure {measure.number}
                        </p>
                        <p className="mt-2 text-sm text-white">{measure.label}</p>
                      </div>
                      <div className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/65">
                        {measure.chord}
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-white/7 bg-white/[0.03] p-4">
                      <pre className="overflow-hidden text-xs leading-5 text-white/82">
                        {measure.strings.join("\n")}
                      </pre>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[18px] border border-white/8 bg-black/30 p-5">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <p className="type-label text-[var(--color-accent)]">
                      Session notes
                    </p>
                    <p className="mt-1 text-sm text-white">{demoSession.notes}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
                <p className="type-label text-[var(--color-accent)]">Exports</p>
                <div className="mt-5 space-y-3">
                  {demoSession.exports.map((format) => (
                    <div
                      key={format.label}
                      className="rounded-[12px] border border-white/7 bg-black/25 px-4 py-4"
                    >
                      <p className="text-sm text-white">{format.label}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {format.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[18px] border border-white/8 bg-black/30 p-5">
                <p className="type-label text-[var(--color-accent)]">
                  Arrangement tools
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: ListMusic, label: "Section navigator" },
                    { icon: SlidersHorizontal, label: "Playback speed" },
                    { icon: Repeat, label: "Loop staging" },
                  ].map((tool) => (
                    <div
                      key={tool.label}
                      className="flex items-center gap-3 rounded-[12px] border border-white/7 bg-white/[0.03] px-4 py-4"
                    >
                      <tool.icon className="h-4 w-4 text-[var(--color-accent)]" />
                      <p className="text-sm text-white">{tool.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 rounded-[18px] border border-white/8 bg-black/40 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="type-label text-[var(--color-accent)]">Transport</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Visual-only transport for phase 1. The custom Plexus player is
                  intentionally deferred behind the core studio UI.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Play, label: "Play" },
                  { icon: Repeat, label: "Loop" },
                  { icon: TimerReset, label: "Half speed" },
                ].map((action) => (
                  <Button key={action.label} type="button" variant="outline">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
