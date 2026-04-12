import type { ReactNode } from "react";
import { ActionLink } from "@/components/shared/ActionLink";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { StudioPageFrame } from "@/components/studio/shared";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  children,
}: AuthPageShellProps) {
  return (
    <StudioPageFrame>
      <header className="mx-auto mb-8 flex w-full max-w-7xl flex-col gap-5 lg:px-10 sm:flex-row sm:items-center sm:justify-between">
        <PlexusLogo />
        <div className="flex flex-wrap items-center gap-3">
          <ActionLink href="/studio/demo" variant="secondary">
            Preview workspace
          </ActionLink>
          <ActionLink href="/" variant="ghost">
            Back to landing
          </ActionLink>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,480px)] lg:px-10">
        <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)] sm:p-8 lg:p-10">
          <p className="type-label text-[var(--color-accent)]">{eyebrow}</p>
          <h1 className="type-display mt-5 max-w-2xl text-balance text-4xl tracking-[-0.06em] text-white sm:text-5xl lg:text-[4.25rem] lg:leading-[0.95]">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/62">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ActionLink href={alternateHref} variant="ghost">
              {alternateLabel}
            </ActionLink>
            <p className="text-sm text-white/42">Use the same account in studio and profile.</p>
          </div>
        </div>

        <div className="min-w-0 rounded-[26px] border border-white/8 bg-black/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
          <div className="mx-auto w-full max-w-[30rem] min-w-0">
            {children}
          </div>
        </div>
      </section>
    </StudioPageFrame>
  );
}
