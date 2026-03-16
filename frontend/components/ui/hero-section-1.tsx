"use client";

import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  ChevronRight,
  FileMusic,
  Gauge,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { demoSession, featureCards, heroStats, workflowSteps } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { PlexusLogo } from "@/components/shared/PlexusLogo";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 14,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.22,
        duration: 1.1,
      },
    },
  },
};

const menuItems = [
  { name: "Workflow", href: "#workflow" },
  { name: "Preview", href: "#preview" },
  { name: "Exports", href: "#exports" },
  { name: "Audience", href: "#audience" },
];

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
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
              <AnimatedGroup variants={transitionVariants}>
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

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/50">Signal intake</p>
                          <p className="mt-2 text-xl text-white">Velvet Lights.wav</p>
                        </div>
                        <div className="rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/58">
                          112 BPM / Drop D
                        </div>
                      </div>

                      <div className="mt-6 rounded-[16px] border border-white/8 bg-black/60 p-4">
                        <div className="waveform-bars h-36" aria-hidden="true">
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

                    <div className="grid gap-4">
                      <div className="rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
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

                      <div className="rounded-[18px] border border-white/8 bg-white/[0.025] p-5">
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

        <section className="border-y border-white/6 bg-black/20 py-16 md:py-24">
          <div className="group relative mx-auto max-w-6xl px-6 lg:px-10">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                href="/studio"
                className="text-sm text-white/78 transition-opacity duration-150 hover:opacity-75"
              >
                Explore the studio
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 transition-all duration-500 group-hover:opacity-45 md:grid-cols-4">
              {[
                { icon: AudioLines, label: "Audio intake" },
                { icon: Gauge, label: "Tempo + tuning" },
                { icon: Sparkles, label: "AI structuring" },
                { icon: FileMusic, label: "Export stack" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-24 items-center justify-center rounded-[18px] border border-white/8 bg-white/[0.025] p-4"
                >
                  <div className="text-center">
                    <item.icon className="mx-auto size-5 text-white/72" />
                    <p className="mt-3 text-sm text-white/72">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingSections />
      </main>
    </>
  );
}

function LandingSections() {
  return (
    <>
      <section
        id="workflow"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
      >
        <AnimatedGroup className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">
            Workflow
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl leading-tight tracking-[-0.06em] text-white md:text-5xl">
            A landing page that shows the product instead of decorating around it.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/52">
            The motion stays purposeful: elements settle in as they enter the viewport,
            cards react on hover, and the hierarchy stays clean enough to feel credible.
          </p>
        </AnimatedGroup>

        <AnimatedGroup className="mt-12 grid gap-5 lg:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <article
              key={step.title}
              className="group rounded-[22px] border border-white/8 bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/16 hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                  0{index + 1}
                </span>
                <step.icon className="size-5 text-white/72 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-10 text-2xl tracking-[-0.04em] text-white">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/50">
                {step.description}
              </p>
            </article>
          ))}
        </AnimatedGroup>
      </section>

      <section
        id="preview"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
      >
        <AnimatedGroup className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.025] p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">
                  Demo workspace
                </p>
                <h3 className="mt-3 text-3xl tracking-[-0.05em] text-white">
                  {demoSession.title}
                </h3>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/studio/demo">Open workspace</Link>
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {demoSession.measures.slice(0, 4).map((measure) => (
                <div
                  key={measure.number}
                  className="rounded-[16px] border border-white/8 bg-black/35 p-4 transition-all duration-300 hover:border-white/15 hover:bg-black/50"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/42">
                    <span>Measure {measure.number}</span>
                    <span>{measure.chord}</span>
                  </div>
                  <pre className="mt-4 overflow-hidden text-xs leading-5 text-white/76">
                    {measure.strings.join("\n")}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-[22px] border border-white/8 bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3 text-white/44">
                  <feature.icon className="size-4 text-white/70" />
                  <span className="text-[11px] uppercase tracking-[0.2em]">
                    {feature.kicker}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl tracking-[-0.04em] text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </AnimatedGroup>
      </section>

      <section
        id="exports"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
      >
        <AnimatedGroup className="rounded-[26px] border border-white/8 bg-white/[0.025] p-6 lg:p-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">
              Export system
            </p>
            <h2 className="mt-4 text-4xl tracking-[-0.06em] text-white md:text-5xl">
              Keep the output structured enough to leave the browser cleanly.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {demoSession.exports.map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-white/8 bg-black/35 p-5 transition-all duration-300 hover:border-white/16 hover:bg-black/50"
              >
                <p className="text-lg tracking-[-0.03em] text-white">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
        </AnimatedGroup>
      </section>
    </>
  );
}

function HeroHeader() {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav data-state={menuState ? "active" : "closed"} className="fixed z-40 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-4 transition-all duration-300 lg:px-10",
            isScrolled &&
              "max-w-5xl rounded-[18px] border border-white/10 bg-black/55 backdrop-blur-xl",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <PlexusLogo />

              <button
                onClick={() => setMenuState((value) => !value)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-3 block p-2.5 lg:hidden"
                type="button"
              >
                <Menu
                  className={cn(
                    "size-6 transition-all duration-200",
                    menuState && "scale-0 opacity-0",
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 m-auto size-6 scale-0 opacity-0 transition-all duration-200",
                    menuState && "scale-100 opacity-100",
                  )}
                />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm text-white/54">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="transition-colors duration-200 hover:text-white">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/studio/demo">Demo</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/studio">Open Studio</Link>
              </Button>
            </div>

            <div
              className={cn(
                "w-full rounded-[18px] border border-white/10 bg-black/80 p-6 shadow-2xl shadow-black/40 lg:hidden",
                menuState ? "block" : "hidden",
              )}
            >
              <ul className="space-y-5 text-base text-white/72">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} onClick={() => setMenuState(false)}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild variant="outline">
                  <Link href="/studio/demo">Preview the workspace</Link>
                </Button>
                <Button asChild>
                  <Link href="/studio">Open Studio</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
