"use client";

import { motion, useReducedMotion } from "motion/react";

export function AnimatedCounter({ value, children, className }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {children ?? value}
    </motion.span>
  );
}
