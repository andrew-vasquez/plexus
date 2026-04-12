import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { signalItems } from "@/components/landing/constants";

export function SignalStrip() {
  return (
    <section className="border-y border-white/6 bg-black/20 py-16 md:py-24">
      <div className="group relative mx-auto max-w-6xl px-6 lg:px-10">
        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
          <Link
            to="/studio"
            className="text-sm text-white/78 transition-opacity duration-150 hover:opacity-75"
          >
            Explore the studio
            <ChevronRight className="ml-1 inline-block size-3" />
          </Link>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 transition-all duration-500 group-hover:opacity-45 md:grid-cols-4">
          {signalItems.map((item) => (
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
  );
}
