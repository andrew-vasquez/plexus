"use client";

import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronUp,
  FolderKanban,
  Globe,
  Lock,
  Music2,
  Scissors,
  Search,
  Sparkles,
  TimerReset,
  Volume2,
  Wand2,
  X,
  Zap,
  Flame,
} from "lucide-react";
import { StudioPageFrame, StudioTopBar } from "@/components/studio/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const spring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 24,
  mass: 0.95,
};

const reveal = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
};

const capsuleTween = {
  duration: 0.26,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

const inviteItems = [
  {
    icon: FolderKanban,
    title: "Sonora Repository",
    detail: "Contribute to the code repository",
  },
  {
    icon: Sparkles,
    title: "Design Tokens",
    detail: "Collaborate on the design language",
  },
  {
    icon: Zap,
    title: "Motion Kit",
    detail: "Explore the interaction library",
  },
  {
    icon: Wand2,
    title: "Build Tools",
    detail: "Review the shared tooling stack",
  },
];

const platformOptions = ["iOS", "macOS", "tvOS"];

function DemoFrame({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
}) {
  return (
    <article className="group rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)] transition-all duration-300 hover:-translate-y-1 hover:border-white/14">
      <div className="mb-4 flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-lg tracking-[-0.03em] text-white">{title}</p>
          <p className="mt-1 text-sm text-white/42">{date}</p>
        </div>
      </div>
      <div className="rounded-[24px] border border-black/30 bg-[#f4f2ef] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[20px] border border-black/6 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(241,239,234,0.98))] p-6 sm:min-h-[360px]">
          {children}
        </div>
      </div>
    </article>
  );
}

function SplitButtonStudy() {
  const [open, setOpen] = useState(false);

  return (
    <LayoutGroup>
      <motion.div layout className="flex items-center gap-3">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.button
              key="back"
              layout
              initial={{ opacity: 0, x: 14, scale: 0.94, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.94, filter: "blur(8px)" }}
              transition={capsuleTween}
              onClick={() => setOpen(false)}
              className="flex size-[3.55rem] items-center justify-center rounded-full bg-[#efede9] text-[#6a655d] shadow-[0_10px_18px_rgba(0,0,0,0.05)]"
              type="button"
            >
              <ChevronLeft className="size-5" strokeWidth={2.2} />
            </motion.button>
          ) : null}
        </AnimatePresence>

        <motion.div layout className="flex items-center gap-3">
          {!open ? (
            <motion.button
              layoutId="split-button-pill"
              onClick={() => setOpen(true)}
              transition={capsuleTween}
              className="min-w-[14.5rem] rounded-full bg-[#efede9] px-8 py-[1.15rem] text-[1.05rem] font-medium tracking-[-0.02em] text-[#44413c] shadow-[0_12px_20px_rgba(0,0,0,0.05)]"
              type="button"
            >
              New Project
            </motion.button>
          ) : (
            platformOptions.map((option, index) => (
              <motion.button
                key={option}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(8px)" }}
                transition={{ ...capsuleTween, delay: index * 0.028 }}
                className="min-w-[8.75rem] rounded-full bg-[#efede9] px-7 py-[1.15rem] text-[1.05rem] font-medium tracking-[-0.02em] text-[#44413c] shadow-[0_12px_20px_rgba(0,0,0,0.05)]"
                type="button"
              >
                {option}
              </motion.button>
            ))
          )}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

function InlineActionStudy() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <motion.button
      layout
      transition={spring}
      onClick={() => setConfirmed((value) => !value)}
      className="flex items-center gap-3 rounded-full bg-[#fdfcf9] px-4 py-3 text-[#141414] shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
      type="button"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-[#f0ede7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <CalendarDays className="size-5" />
      </span>
      <span className="min-w-[7ch] text-left text-[1.05rem] font-semibold">Calendar</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {confirmed ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.8, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 8 }}
            transition={spring}
            className="flex size-10 items-center justify-center rounded-full bg-[#141414] text-white"
          >
            <Check className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="action"
            initial={{ opacity: 0, scale: 0.92, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: -8 }}
            transition={spring}
            className="rounded-full bg-[#efede8] px-5 py-2.5 text-sm font-semibold text-[#232323]"
          >
            Sync Events
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function MorphingButtonStudy() {
  const [active, setActive] = useState(false);

  return (
    <motion.div layout className="flex items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.button
            key="compact"
            layout
            initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
            transition={spring}
            onClick={() => setActive(false)}
            className="flex items-center gap-3 rounded-full bg-[#f5f2ed] px-6 py-4 text-[1.02rem] font-semibold text-[#171717] shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
            type="button"
          >
            <Bell className="size-5" />
            Notify Me
          </motion.button>
        ) : (
          <motion.button
            key="expanded"
            layout
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
            transition={spring}
            onClick={() => setActive(true)}
            className="flex items-center rounded-full bg-[#efede8] p-2 text-[#171717] shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            type="button"
          >
            <span className="min-w-[10rem] px-5 text-left text-[1.02rem] text-[#9b978f]">
              Email
            </span>
            <span className="rounded-full bg-[#fffdf9] px-6 py-3 text-[1.02rem] font-semibold shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
              Notify Me
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InviteDisclosureStudy() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      transition={spring}
      className="w-full max-w-[22rem] rounded-[2rem] bg-[#efede8] p-3 text-[#151515] shadow-[0_18px_44px_rgba(0,0,0,0.1)]"
    >
      <motion.div layout className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[1.05rem] font-semibold">Invites</span>
          {!open ? (
            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={spring}
              className="flex size-8 items-center justify-center rounded-full bg-[#151515] text-sm font-semibold text-white"
            >
              2
            </motion.span>
          ) : null}
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex size-9 items-center justify-center rounded-full bg-[#fbfaf7] text-[#1b1b1b]"
          type="button"
        >
          {open ? <X className="size-4" /> : <span className="text-sm font-semibold">2</span>}
        </button>
      </motion.div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={reveal}
            className="overflow-hidden"
          >
            <div className="grid gap-3 px-1 pb-1 pt-2">
              {inviteItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ ...spring, delay: index * 0.03 }}
                  className="flex items-center gap-3 rounded-[1.4rem] bg-[#fbfaf7] px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.05)]"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#f0ede7] text-[#4d4d4d]">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1b1b1b]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#6b6862]">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function AccessModeStudy() {
  const [mode, setMode] = useState<"private" | "public">("private");
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="choices"
            initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(12px)" }}
            transition={spring}
            className="flex rounded-[1.6rem] bg-[#f7f5f1] p-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
          >
            {[
              { value: "private" as const, icon: Lock, label: "Private" },
              { value: "public" as const, icon: Globe, label: "Public" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setMode(item.value);
                  setExpanded(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-[1.3rem] px-5 py-3 text-[1.02rem] font-semibold transition-all duration-300",
                  mode === item.value
                    ? "bg-white text-[#151515] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
                    : "text-[#2f2f2f]/82",
                )}
                type="button"
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        layout
        transition={spring}
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center gap-3 rounded-full bg-[#ece9e4] px-6 py-4 text-[1.04rem] font-semibold text-[#1b1b1b] shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
        type="button"
      >
        {mode === "private" ? <Lock className="size-4" /> : <Globe className="size-4" />}
        <span className="capitalize">{mode}</span>
        <ChevronUp
          className={cn(
            "size-4 transition-transform duration-300",
            expanded ? "rotate-0" : "rotate-180",
          )}
        />
      </motion.button>
    </div>
  );
}

function ContextualToolbarStudy() {
  const [active, setActive] = useState("sparkles");

  const actions = [
    { id: "music", icon: Music2 },
    { id: "sparkles", icon: Sparkles },
    { id: "cut", icon: Scissors },
    { id: "timer", icon: TimerReset },
    { id: "edit", icon: Wand2 },
    { id: "audio", icon: Volume2 },
  ];

  return (
    <motion.div
      layout
      transition={spring}
      className="flex items-center rounded-full bg-[#f5f2ed] p-1.5 shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const selected = active === action.id;

        return (
          <button
            key={action.id}
            onClick={() => setActive(action.id)}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-full text-[#121212] transition-all duration-300",
              selected && "bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]",
            )}
            type="button"
          >
            {selected ? (
              <motion.span
                layoutId="toolbar-active"
                className="absolute inset-0 rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
                transition={spring}
              />
            ) : null}
            <Icon className="relative z-10 size-4.5" />
          </button>
        );
      })}
    </motion.div>
  );
}

function CopyTokenStudy() {
  const [copied, setCopied] = useState(false);

  return (
    <motion.button
      layout
      transition={spring}
      onClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="flex items-center gap-3 rounded-full bg-[#efede8] p-2 text-[#1a1a1a] shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
      type="button"
    >
      <motion.span
        layout
        className="min-w-[10.75rem] px-5 text-left text-[1.02rem] font-semibold tracking-[0.08em] text-[#7f7a72]"
      >
        {copied ? "Code Copied!" : "B3E45S7T"}
      </motion.span>
      <motion.span
        layout
        className={cn(
          "rounded-full px-6 py-3 text-[1rem] font-semibold shadow-[0_10px_20px_rgba(0,0,0,0.08)]",
          copied ? "bg-[#151515] text-white" : "bg-[#fffdf9] text-[#1a1a1a]",
        )}
      >
        {copied ? <Check className="size-4" /> : "Copy"}
      </motion.span>
    </motion.button>
  );
}

function SearchMorphStudy() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <motion.button
        layout
        transition={spring}
        onClick={() => setExpanded((value) => !value)}
        className="flex size-13 items-center justify-center rounded-full bg-[#fffdf9] text-[#171717] shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
        type="button"
      >
        <Search className="size-5" />
      </motion.button>

      <motion.div
        layout
        transition={spring}
        className="flex items-center rounded-full bg-[#fffdf9] shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {expanded ? (
            <>
              <motion.span
                key="popular"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={spring}
                className="mx-2 rounded-full bg-[#fff0f0] px-5 py-3 text-[1.02rem] font-semibold text-[#d13a58]"
              >
                <span className="inline-flex items-center gap-2">
                  <Flame className="size-4" />
                  Popular
                </span>
              </motion.span>
              <motion.span
                key="favorites"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ ...spring, delay: 0.02 }}
                className="pr-6 text-[1.02rem] font-semibold text-[#191919]"
              >
                Favorites
              </motion.span>
            </>
          ) : (
            <motion.span
              key="search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={spring}
              className="min-w-[13rem] px-6 text-left text-[1.02rem] text-[#a09b93]"
            >
              Search
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        layout
        transition={spring}
        onClick={() => setExpanded(false)}
        className="flex size-13 items-center justify-center rounded-full bg-[#fffdf9] text-[#171717] shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
        type="button"
      >
        <X className="size-5" />
      </motion.button>
    </div>
  );
}

function ScheduleCapsuleStudy() {
  const [selected, setSelected] = useState("weekly");

  const modes = ["daily", "weekly", "monthly", "yearly"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      layout
      transition={spring}
      className="rounded-[1.9rem] bg-[#f4f2ed] p-2.5 shadow-[0_18px_38px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-1.5">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => setSelected(mode)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize text-[#6f6a62] transition-all duration-300",
              selected === mode && "bg-white text-[#151515] shadow-[0_6px_14px_rgba(0,0,0,0.08)]",
            )}
            type="button"
          >
            {mode}
          </button>
        ))}
        <button
          className="ml-1 flex size-10 items-center justify-center rounded-full bg-[#121212] text-white"
          type="button"
        >
          <Check className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {days.map((day) => (
          <button
            key={day}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium text-[#6f6a62] transition-all duration-300",
              day === "Tue" && "bg-white text-[#151515] shadow-[0_6px_14px_rgba(0,0,0,0.08)]",
            )}
            type="button"
          >
            {day}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function MotionShowcase() {
  return (
    <StudioPageFrame>
      <StudioTopBar
        backHref="/"
        backLabel="Back to landing"
        secondaryAction={
          <Button asChild variant="outline" size="sm" className="hover:translate-y-0">
            <Link href="/studio/demo">Open demo workspace</Link>
          </Button>
        }
      />

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="type-label text-[var(--color-accent)]">Motion showcase</p>
            <h1 className="type-display mt-4 text-balance text-4xl tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Interaction studies built from your screen recording.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">
              These are Plexus-adapted motion patterns: soft capsule morphs,
              expanding split controls, inline confirmations, and disclosure
              panels you can click through directly.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/showcase">Refresh showcase</Link>
            </Button>
            <p className="text-sm text-white/42">
              Tap any study to open, morph, or reset it.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <DemoFrame title="Platform Fanout Capsule" date="09 February 26">
              <SplitButtonStudy />
            </DemoFrame>

            <DemoFrame title="Calendar Confirm Capsule" date="26 January 26">
              <InlineActionStudy />
            </DemoFrame>

            <DemoFrame title="Notify Morph Capsule" date="18 January 26">
              <MorphingButtonStudy />
            </DemoFrame>

            <DemoFrame title="Invite Stack Drawer" date="09 January 26">
              <InviteDisclosureStudy />
            </DemoFrame>

            <DemoFrame title="Access Mode Picker" date="02 January 26">
              <AccessModeStudy />
            </DemoFrame>

            <DemoFrame title="Context Action Rail" date="21 December 25">
              <ContextualToolbarStudy />
            </DemoFrame>

            <DemoFrame title="Copy Token Capsule" date="29 November 25">
              <CopyTokenStudy />
            </DemoFrame>

            <DemoFrame title="Search Filter Morph" date="07 December 25">
              <SearchMorphStudy />
            </DemoFrame>

            <DemoFrame title="Weekly Rhythm Capsule" date="29 November 25">
              <ScheduleCapsuleStudy />
            </DemoFrame>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              "Soft monochrome capsules with spring-driven width changes and low-contrast rails.",
              "Names now describe the visual pattern so the library reads like a motion vocabulary.",
              "New studies cover pickers, rails, copy states, filters, and schedule chips from the recording.",
            ].map((note) => (
              <div
                key={note}
                className={cn(
                  "rounded-[18px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/70",
                  "transition-all duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/[0.05]",
                )}
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>
    </StudioPageFrame>
  );
}
