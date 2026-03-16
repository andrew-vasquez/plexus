import Link from "next/link";

export function PlexusLogo() {
  return (
    <Link className="inline-flex items-center gap-3" href="/">
      <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border border-white/10 bg-white/[0.03]">
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[var(--color-accent)]" />
        <svg
          aria-hidden="true"
          className="relative h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 12.2h5.3l2.7-4.4 2.7 8.4 1.8-4h3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      <span>
        <span className="type-display block text-xl tracking-[-0.05em] text-white">
          Plexus
        </span>
        <span className="type-label block text-white/45">audio to tab</span>
      </span>
    </Link>
  );
}
