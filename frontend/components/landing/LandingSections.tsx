import Link from "next/link";
import { audienceCards, demoSession, featureCards, workflowSteps } from "@/lib/demo-data";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";

export function LandingSections() {
  return (
    <>
      <WorkflowSection />
      <PreviewSection />
      <ExportsSection />
      <AudienceSection />
    </>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <AnimatedGroup>
        <SectionHeading
          eyebrow="Workflow"
          title="A landing page that shows the product instead of decorating around it."
          description="The motion stays purposeful: elements settle in as they enter the viewport, cards react on hover, and the hierarchy stays clean enough to feel credible."
        />
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
            <h3 className="mt-10 text-2xl tracking-[-0.04em] text-white">{step.title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/50">{step.description}</p>
          </article>
        ))}
      </AnimatedGroup>
    </section>
  );
}

function PreviewSection() {
  return (
    <section id="preview" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
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

          <div className="mt-4 grid gap-4 border-t border-white/8 pt-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[16px] border border-white/8 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Session note
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/56">
                {demoSession.notes}
              </p>
            </div>
            <div className="rounded-[16px] border border-white/8 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Structure pass
              </p>
              <div className="mt-4 space-y-3">
                {demoSession.sections.map((section) => (
                  <div
                    key={section.name}
                    className="flex items-center justify-between gap-3 text-sm text-white/74"
                  >
                    <span>{section.name}</span>
                    <span className="text-xs text-white/40">{section.measures}</span>
                  </div>
                ))}
              </div>
            </div>
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
  );
}

function ExportsSection() {
  return (
    <section id="exports" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
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
  );
}

function AudienceSection() {
  return (
    <section id="audience" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <AnimatedGroup className="rounded-[26px] border border-white/8 bg-white/[0.025] p-6 lg:p-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">
              Audience
            </p>
            <h2 className="mt-4 max-w-xl text-4xl tracking-[-0.06em] text-white md:text-5xl">
              Built for players who want less friction between hearing and playing.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-white/52">
            Plexus should feel credible to experienced guitarists, clear to teachers,
            and inviting to newer players. The interface stays technical without
            becoming cold, and the workflow stays fast without looking disposable.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {audienceCards.map((audience) => (
            <article
              key={audience.title}
              className="group rounded-[18px] border border-white/8 bg-black/35 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-black/50"
            >
              <p className="text-lg tracking-[-0.03em] text-white">{audience.title}</p>
              <p className="mt-3 text-sm leading-7 text-white/50">
                {audience.description}
              </p>
            </article>
          ))}
        </div>
      </AnimatedGroup>
    </section>
  );
}
