import Link from "next/link";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { menuItems } from "@/components/landing/constants";
import { scrollToHash } from "@/components/landing/utils";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/6">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-md">
          <PlexusLogo />
          <p className="mt-5 text-sm leading-7 text-white/46">
            Plexus is an AI powered transcription studio for turning
            guitar audio into clean review-ready tabs and export paths.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
              Navigate
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/62">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(event) => scrollToHash(event, item.href)}
                  className="block transition-colors duration-200 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
              Product
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/62">
              <Link href="/studio" className="block transition-colors duration-200 hover:text-white">
                Open Studio
              </Link>
              <Link
                href="/studio/demo"
                className="block transition-colors duration-200 hover:text-white"
              >
                Demo Workspace
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
              Output
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/62">
              <p>Guitar Pro draft</p>
              <p>Practice PDF</p>
              <p>MIDI sketch</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
