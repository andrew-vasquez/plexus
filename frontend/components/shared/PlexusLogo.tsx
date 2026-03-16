import Link from "next/link";
import { PlexusMark } from "@/components/shared/PlexusMark";

export function PlexusLogo() {
  return (
    <Link
      className="group motion-brand inline-flex items-center gap-3 "
      href="/"
    >
      <span className="motion-brand relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border border-white/10 bg-white/[0.03] group-hover:border-white/18 group-hover:bg-white/[0.06] group-hover:shadow-[0_18px_38px_-24px_rgba(0,0,0,0.78)]">
        <span className="motion-brand absolute inset-y-0 left-0 w-[3px] bg-[var(--color-accent)] group-hover:opacity-100" />
        <PlexusMark className="motion-brand relative h-5 w-5 text-white" />
      </span>
      <span className="motion-brand group-hover:translate-x-[1px]">
        <span className="motion-brand type-display block text-xl tracking-[-0.05em] text-white group-hover:text-white">
          Plexus
        </span>
        <span className="motion-brand type-label block text-white/45 group-hover:text-white/62">
          audio to tab
        </span>
      </span>
    </Link>
  );
}
