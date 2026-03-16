"use client";

import { useMemo } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import {
  useHydrated,
  useSimpleMotion as usePointerSimpleMotion,
} from "@/components/ui/use-simple-motion";
import { cn } from "@/lib/utils";

type TextEffectProps = {
  children: string;
  className?: string;
  as?: keyof typeof motion;
  delay?: number;
  trigger?: boolean;
  animateOnMount?: boolean;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 10 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.85,
    },
  },
};

const simpleItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export function TextEffect({
  children,
  className,
  as = "p",
  delay = 0,
  trigger = true,
  animateOnMount = false,
}: TextEffectProps) {
  const prefersReducedMotion = useReducedMotion();
  const prefersSimpleMotion = usePointerSimpleMotion();
  const hasMounted = useHydrated();

  const useSimpleMotion = prefersReducedMotion || prefersSimpleMotion;
  const revealOnMount = !hasMounted || animateOnMount || useSimpleMotion;
  const segments = useMemo(() => children.split(" "), [children]);
  const MotionTag = motion[as] as typeof motion.p;

  return (
    trigger ? (
      <MotionTag
        initial={!hasMounted ? false : "hidden"}
        animate={revealOnMount ? "visible" : undefined}
        whileInView={revealOnMount ? undefined : "visible"}
        viewport={revealOnMount ? undefined : { once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: useSimpleMotion ? 0.02 : 0.035,
              delayChildren: delay,
            },
          },
        }}
        className={cn(className)}
      >
        {useSimpleMotion ? (
          <motion.span
            variants={simpleItemVariants}
            className="inline-block whitespace-pre-wrap"
          >
            {children}
          </motion.span>
        ) : (
          segments.map((segment, index) => (
            <motion.span
              key={`${segment}-${index}`}
              variants={itemVariants}
              className="inline-block whitespace-pre"
            >
              {segment}
              {index < segments.length - 1 ? " " : ""}
            </motion.span>
          ))
        )}
      </MotionTag>
    ) : null
  );
}
