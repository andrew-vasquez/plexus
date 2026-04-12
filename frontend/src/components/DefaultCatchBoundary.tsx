import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-6 py-24">
      <div className="surface-panel w-full max-w-2xl p-8 text-center">
        <p className="type-label text-[var(--color-accent)]">Application error</p>
        <h1 className="mt-4 text-4xl tracking-[-0.05em] text-white">
          Something broke in the Plexus shell.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/60">
          {error.message || "An unexpected error interrupted the route."}
        </p>
      </div>
    </div>
  );
}
