import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { ActionLink } from "@/components/shared/ActionLink";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";

export const studioPanelClass =
  "rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)]";

export const studioRailClass =
  "rounded-[22px] border border-white/8 bg-black/26 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

export const studioInsetCardClass =
  "rounded-[18px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_68%),rgba(255,255,255,0.02)] transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/14 hover:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_68%),rgba(255,255,255,0.03)] hover:shadow-[0_24px_60px_-42px_rgba(0,0,0,0.9)]";

type StudioPageFrameProps = {
  children: ReactNode;
};

type StudioTopBarProps = {
  secondaryAction?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

type StudioSurfaceProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  stats: { label: string; value: string }[];
  children: ReactNode;
};

export function StudioPageFrame({ children }: StudioPageFrameProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5f5f2]">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(207,255,84,0.1),transparent_28%),radial-gradient(circle_at_75%_28%,rgba(120,170,255,0.08),transparent_34%)]"
      />
      <div className="pointer-events-none absolute inset-y-0 left-[10%] hidden w-px bg-white/[0.04] xl:block" />
      <div className="pointer-events-none absolute inset-y-0 right-[12%] hidden w-px bg-white/[0.04] xl:block" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}

export function StudioTopBar({
  secondaryAction,
  backHref,
  backLabel,
}: StudioTopBarProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <AnimatedGroup
        animateOnMount
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <PlexusLogo />
        <div className="hidden h-10 w-px bg-white/8 sm:block" />
        {backHref ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hover:translate-y-0"
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-2 size-4" />
              {backLabel}
            </Link>
          </Button>
        ) : (
          <ActionLink href="/" variant="ghost">
            Back to landing
          </ActionLink>
        )}
      </AnimatedGroup>

      <AnimatedGroup
        animateOnMount
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        {secondaryAction}
      </AnimatedGroup>
    </header>
  );
}

export function StudioSurface({
  eyebrow,
  title,
  description,
  stats,
  children,
}: StudioSurfaceProps) {
  return (
    <AnimatedGroup animateOnMount className={`${studioPanelClass} p-6 sm:p-8`}>
      <div className="flex min-w-0 flex-col gap-8 border-b border-white/8 pb-8">
        <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="type-label text-[var(--color-accent)]">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/64">
              {description}
            </p>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className={`${studioInsetCardClass} min-w-0 p-4`}>
                <p className="type-label text-white/42">{stat.label}</p>
                <p className="mt-3 break-words text-sm leading-relaxed text-white/84">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {children}
    </AnimatedGroup>
  );
}
