"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/components/landing/constants";
import { scrollToHash } from "@/components/landing/utils";
import { cn } from "@/lib/utils";

export function HeroHeader() {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav data-state={menuState ? "active" : "closed"} className="fixed z-40 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-4 transition-all duration-300 lg:px-10",
            (isScrolled || menuState) &&
              "max-w-5xl overflow-hidden rounded-[18px] border border-white/10 bg-black/55 shadow-[0_22px_60px_-38px_rgba(0,0,0,0.88)] backdrop-blur-xl supports-[backdrop-filter]:bg-black/44",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <PlexusLogo />

              <button
                onClick={() => setMenuState((value) => !value)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-3 block p-2.5 lg:hidden"
                type="button"
              >
                <Menu
                  className={cn(
                    "size-6 transition-all duration-200",
                    menuState && "scale-0 opacity-0",
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 m-auto size-6 scale-0 opacity-0 transition-all duration-200",
                    menuState && "scale-100 opacity-100",
                  )}
                />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm text-white/54">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={(event) => scrollToHash(event, item.href)}
                      className="transition-colors duration-200 hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/studio/demo">Demo</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/studio">Open Studio</Link>
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {menuState ? (
                <motion.div
                  key="mobile-menu-dismiss"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  aria-hidden="true"
                  className="fixed inset-0 z-30 bg-transparent lg:hidden"
                  onClick={() => setMenuState(false)}
                />
              ) : null}
            </AnimatePresence>

            <motion.div
              initial={false}
              animate={{
                gridTemplateRows: menuState ? "1fr" : "0fr",
                opacity: menuState ? 1 : 0,
              }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "order-last grid w-full overflow-hidden lg:hidden",
                !menuState && "pointer-events-none",
              )}
            >
              <motion.div
                initial={false}
                animate={{ y: menuState ? 0 : -10 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-0"
              >
                <div className="max-h-[calc(100vh-5.25rem)] overflow-y-auto overscroll-contain border-t border-white/8 px-1 pb-4 pt-6">
                  <ul className="space-y-6 text-base text-white/72">
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={(event) =>
                            scrollToHash(event, item.href, () => setMenuState(false))
                          }
                          className="transition-colors duration-200 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-6">
                    <Button asChild variant="outline">
                      <Link href="/studio/demo" onClick={() => setMenuState(false)}>
                        Preview the workspace
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/studio" onClick={() => setMenuState(false)}>
                        Open Studio
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </nav>
    </header>
  );
}
