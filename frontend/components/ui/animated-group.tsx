"use client";

import type { ReactNode } from "react";
import React from "react";
import { motion, type Variants } from "framer-motion";
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

export function AnimatedGroup({
  children,
  className,
  variants,
  once = true,
  animateOnMount = false,
}: AnimatedGroupProps) {
  const containerVariants = variants?.container ?? defaultContainerVariants;
  const itemVariants = variants?.item ?? defaultItemVariants;

  return (
    <motion.div
      initial="hidden"
      animate={animateOnMount ? "visible" : undefined}
      whileInView={animateOnMount ? undefined : "visible"}
      viewport={animateOnMount ? undefined : { once, amount: 0.2 }}
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
