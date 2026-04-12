import { Link } from "@tanstack/react-router";
import {
  Gauge,
  Headphones,
  ListMusic,
  Play,
  Repeat,
  SlidersHorizontal,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoSession } from "@/lib/demo-data";
import {
  studioInsetCardClass,
  studioRailClass,
} from "@/components/studio/shared";

export function DemoSectionsRail() {
  return (
    <aside className={`${studioRailClass} h-full min-w-0 p-5`}>
      <div className={`${studioInsetCardClass} p-5`}>
        <p className="type-label text-white/42">Arrangement map</p>
        <div className="mt-5 space-y-3">
          {demoSession.sections.map((section, index) => (
            <button
              key={section.name}
              type="button"
              className={`w-full rounded-[18px] border px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                index === 1
                  ? "border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.9)]"
                  : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg tracking-[-0.03em] text-white">
                    {section.name}
                  </p>
                  <p className="mt-2 text-[0.95rem] leading-7 text-white/52">
                    {section.note}
                  </p>
                </div>
                <span className="type-label shrink-0 text-white/38">
                  {section.measures}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function DemoTabPanel() {
  return (
    <section className="min-w-0 space-y-6">
      <div className={`${studioRailClass} min-w-0 p-6`}>
        <div className="flex min-w-0 flex-col gap-6 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="type-label text-white/42">Section focus</p>
            <h2 className="mt-3 text-3xl tracking-[-0.05em] text-white">
              Verse arrangement
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">
              Dense palm-muted movement with a cleaner lift into the chorus. The
              layout stays readable now so the future player can layer in sync
              and playback without redesigning the core surface.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hover:translate-y-0"
            >
              <Link to="/studio">Back to studio</Link>
            </Button>
            <Button variant="outline" size="sm" className="hover:translate-y-0">
              Export preview
            </Button>
          </div>
        </div>

        <div className={`${studioInsetCardClass} mt-6 p-4`}>
          <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-white/42">
            <span>Playback lane</span>
            <span>01:28 / 03:14</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
            <div className="h-2 w-[44%] rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(122,215,255,0.72))]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/40">
            <span>Verse lock</span>
            <span>Loop ready</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {demoSession.measures.map((measure) => (
            <article key={measure.number} className={`${studioInsetCardClass} min-w-0 p-5`}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="type-label text-white/42">Measure {measure.number}</p>
                  <p className="mt-2 text-base text-white/74">{measure.label}</p>
                </div>
                <span className="shrink-0 text-[1.2rem] tracking-[-0.04em] text-white/72">
                  {measure.chord}
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-[14px] border border-white/7 bg-white/[0.03] p-4 font-mono text-[0.95rem] leading-7 text-white/72">
                {measure.strings.map((line) => (
                  <p key={line} className="tab-line min-w-[220px]">
                    {line}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoRightRail() {
  return (
    <aside className={`${studioRailClass} h-full min-w-0 p-5`}>
      <div className={`${studioInsetCardClass} p-5`}>
        <p className="type-label text-white/42">Inspector</p>
        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-4">
            <Gauge className="mt-0.5 size-5 shrink-0 text-white/78" />
            <div className="min-w-0">
              <p className="text-lg text-white">Detected profile</p>
              <p className="mt-1 text-sm leading-relaxed text-white/54">
                {demoSession.detectedTempo} • {demoSession.tuning}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <ListMusic className="mt-0.5 size-5 shrink-0 text-white/78" />
            <div className="min-w-0">
              <p className="text-lg text-white">Section logic</p>
              <p className="mt-1 text-sm leading-relaxed text-white/54">
                {demoSession.notes}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Headphones className="mt-0.5 size-5 shrink-0 text-white/78" />
            <div className="min-w-0">
              <p className="text-lg text-white">Playback layer</p>
              <p className="mt-1 text-sm leading-relaxed text-white/54">
                Transport, looping, and sync controls are staged visually for the
                future custom player.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${studioInsetCardClass} mt-5 p-5`}>
        <p className="type-label text-white/42">Export path</p>
        <div className="mt-5 space-y-3">
          {demoSession.exports.map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-white/8 bg-white/[0.02] px-4 py-4 transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/14 hover:bg-white/[0.03]"
            >
              <p className="text-lg text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/54">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function DemoTransportBar() {
  return (
    <div className={`${studioRailClass} mt-6 p-4`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon" aria-label="Play" className="hover:translate-y-0">
            <Play className="size-4 fill-current" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Loop"
            className="hover:translate-y-0"
          >
            <Repeat className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset loop"
            className="hover:translate-y-0"
          >
            <TimerReset className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Mix controls"
            className="hover:translate-y-0"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        <div className="flex-1 xl:px-6">
          <div className="h-2 rounded-full bg-white/[0.06]">
            <div className="h-full w-[42%] rounded-full bg-[var(--color-accent)]" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/38">
            <span>01:08</span>
            <span>{demoSession.duration}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/58">
          <span className="rounded-[12px] border border-white/8 bg-white/[0.03] px-3 py-2">
            100%
          </span>
          <span className="rounded-[12px] border border-white/8 bg-white/[0.03] px-3 py-2">
            Loop verse
          </span>
        </div>
      </div>
    </div>
  );
}
