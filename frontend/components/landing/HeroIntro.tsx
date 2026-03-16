import Link from "next/link";
import { demoSession, heroStats } from "@/lib/demo-data";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { ArrowRight, transitionVariants } from "@/components/landing/constants";

export function HeroIntro() {
  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_20%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-[520px] max-w-5xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_58%)] blur-3xl"
      />
      <div className="mx-auto max-w-7xl px-6 pt-28 md:pt-36 lg:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <AnimatedGroup animateOnMount variants={transitionVariants}>
            <Link
              href="/studio"
              className="group mx-auto flex w-fit items-center gap-4 rounded-[12px] border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-white/78 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.9)] transition-all duration-300 hover:border-white/22 hover:bg-white/[0.06] hover:text-white"
            >
              <span>Now shaping audio into tab-first workflow</span>
              <span className="h-4 w-px bg-white/12" />
              <span className="flex size-6 items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-black/40">
                <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>

            <TextEffect
              as="h1"
              animateOnMount
              className="mt-10 text-balance text-6xl leading-none tracking-[-0.08em] text-white md:text-7xl lg:mt-16 xl:text-[5.7rem]"
            >
              Turn guitar audio into clean, editable tabs.
            </TextEffect>

            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-8 text-white/58">
              Plexus is an AI transcription studio for players who want a
              fast, precise path from recording to an export-ready guitar part.
            </p>
          </AnimatedGroup>

          <AnimatedGroup
            animateOnMount
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                    delayChildren: 0.22,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
          >
            <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-1">
              <Button asChild size="lg" className="rounded-[10px] px-5">
                <Link href="/studio">
                  Open Studio
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-[10px] px-5"
            >
              <Link href="/studio/demo">Preview the workspace</Link>
            </Button>
          </AnimatedGroup>
        </div>

        <AnimatedGroup
          animateOnMount
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.35,
                },
              },
            },
            ...transitionVariants,
          }}
          className="mt-16 md:mt-20"
        >
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0b] p-3 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.95)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_38%)]" />
            <div className="relative rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 md:p-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 text-xs uppercase tracking-[0.22em] text-white/40">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-white/45" />
                  Plexus Studio Preview
                </div>
                <span>{demoSession.confidence}</span>
              </div>

              <div className="mt-6 grid auto-rows-fr gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="signal-intake-panel h-full rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/50">Signal intake</p>
                      <p className="mt-2 text-xl text-white">Velvet Lights.wav</p>
                    </div>
                    <div className="rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/58">
                      112 BPM / Drop D
                    </div>
                  </div>

                  <div className="signal-intake-frame mt-6 rounded-[16px] border border-white/8 bg-black/60 p-4">
                    <div className="waveform-bars signal-intake-bars h-36" aria-hidden="true">
                      {Array.from({ length: 36 }).map((_, index) => (
                        <span
                          key={index}
                          style={{
                            height: `${24 + ((index * 13) % 82)}px`,
                            animationDelay: `${index * 45}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-full rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
                  <p className="text-sm text-white/50">Structured output</p>
                  <div className="mt-4 space-y-3">
                    {demoSession.sections.map((section) => (
                      <div
                        key={section.name}
                        className="group flex items-center justify-between rounded-[14px] border border-white/7 bg-black/45 px-4 py-3 transition-colors duration-200 hover:border-white/14 hover:bg-white/[0.04]"
                      >
                        <div>
                          <p className="text-sm text-white">{section.name}</p>
                          <p className="mt-1 text-xs text-white/42">{section.note}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/56">
                          {section.measures}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-full rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-md">
                      <p className="text-sm text-white/50">Playback note</p>
                      <p className="mt-3 text-lg leading-8 text-white/92">
                        {demoSession.notes}
                      </p>
                    </div>
                    <div className="hidden rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/50 sm:block">
                      Review ready
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {demoSession.sections.map((section) => (
                      <div
                        key={`${section.name}-pill`}
                        className="rounded-[12px] border border-white/8 bg-black/45 px-3 py-2"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">
                          {section.name}
                        </p>
                        <p className="mt-2 text-sm text-white/78">{section.measures}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-full rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
                  <p className="text-sm text-white/50">Export path</p>
                  <div className="mt-4 grid gap-3">
                    {demoSession.exports.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[14px] border border-white/7 bg-black/45 px-4 py-3 transition-colors duration-200 hover:border-white/14 hover:bg-white/[0.04]"
                      >
                        <p className="text-sm text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-white/42">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedGroup>

        <AnimatedGroup className="mt-8 grid gap-4 md:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[18px] border border-white/8 bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-white/[0.04]"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl tracking-[-0.04em] text-white">
                {stat.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/46">
                {stat.description}
              </p>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
