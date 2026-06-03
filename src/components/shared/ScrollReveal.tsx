"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  y = 24,
  opacity = 0,
  duration = 0.5,
  delay = 0,
  once = true,
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-100px" }}
      transition={{ duration: prefersReduced ? 0 : duration, delay: prefersReduced ? 0 : delay, ease: "easeOut" as const }}
    >
      {children}
    </motion.div>
  );
}
