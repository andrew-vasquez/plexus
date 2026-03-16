"use client";

import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  once?: boolean;
  animateOnMount?: boolean;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 16 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.18,
      duration: 0.9,
    },
  },
};

const simpleItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  variants,
  once = true,
  animateOnMount = false,
}: AnimatedGroupProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersSimpleMotion, setPrefersSimpleMotion] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    const update = () => setPrefersSimpleMotion(mediaQuery.matches);

    update();
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    legacyMediaQuery.addListener?.(update);
    return () => legacyMediaQuery.removeListener?.(update);
  }, []);

  const useSimpleMotion = prefersReducedMotion || prefersSimpleMotion;
  const containerVariants = variants?.container ?? defaultContainerVariants;
  const itemVariants = useSimpleMotion
    ? simpleItemVariants
    : (variants?.item ?? defaultItemVariants);
  const revealOnMount = !hasMounted || animateOnMount || useSimpleMotion;

  return (
    <motion.div
      initial={!hasMounted ? false : "hidden"}
      animate={revealOnMount ? "visible" : undefined}
      whileInView={revealOnMount ? undefined : "visible"}
      viewport={revealOnMount ? undefined : { once, amount: 0.2 }}
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
