import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-6 py-24">
      <div className="surface-panel w-full max-w-2xl p-8 text-center">
        <p className="type-label text-[var(--color-accent)]">404</p>
        <h1 className="mt-4 text-4xl tracking-[-0.05em] text-white">
          This route does not exist.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/60">
          The requested page is outside the current Plexus workspace.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-[10px] border border-white/90 bg-white px-4 py-3 text-sm font-medium text-black"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
