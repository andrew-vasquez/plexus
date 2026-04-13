import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  LandingDesktopAuthActions,
  LandingMobileAuthActions,
} from "@/components/auth/AuthControls";
import { PlexusLogo } from "@/components/shared/PlexusLogo";
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

  useEffect(() => {
    const isMobileViewport = window.matchMedia("(max-width: 1023px)").matches;

    if (menuState && isMobileViewport) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [menuState]);

  return (
    <header>
      <nav
        data-state={menuState ? "active" : "closed"}
        className="fixed z-40 w-full px-2 pt-3 sm:pt-4 lg:pt-0"
      >
        <div
          className={cn(
            "mx-auto max-w-7xl px-4 pt-2 transition-all duration-300 lg:px-10 lg:pt-0",
            (isScrolled || menuState) &&
              "max-w-5xl overflow-hidden rounded-[18px] border border-white/10 bg-black/62 shadow-[0_22px_60px_-38px_rgba(0,0,0,0.88)] backdrop-blur-sm supports-[backdrop-filter]:bg-black/54 sm:bg-black/55 sm:backdrop-blur-xl sm:supports-[backdrop-filter]:bg-black/44",
          )}
        >
          <div className="relative flex min-h-[64px] flex-wrap items-center justify-between gap-4 py-0 lg:min-h-0 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <div className="translate-y-1 lg:translate-y-0">
                <PlexusLogo />
              </div>

              <button
                onClick={() => setMenuState((value) => !value)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-40 flex h-11 w-11 shrink-0 translate-y-1 items-center justify-center lg:translate-y-0 lg:hidden"
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
                    <a
                      href={item.href}
                      onClick={(event) => scrollToHash(event, item.href)}
                      className="transition-colors duration-200 hover:text-white"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <LandingDesktopAuthActions />

            <AnimatePresence initial={false}>
              {menuState ? (
                <motion.div
                  key="mobile-menu-dismiss"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  aria-hidden="true"
                  className="fixed inset-0 z-30 bg-black/24 lg:hidden"
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
                "relative z-40 order-last grid w-full overflow-hidden lg:hidden",
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
                        <a
                          href={item.href}
                          onClick={(event) =>
                            scrollToHash(event, item.href, () => setMenuState(false))
                          }
                          className="transition-colors duration-200 hover:text-white"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-6">
                    <LandingMobileAuthActions
                      onNavigate={() => setMenuState(false)}
                    />
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
