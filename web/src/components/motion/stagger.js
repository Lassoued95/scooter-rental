"use client";

import { motion, useReducedMotion } from "motion/react";

export function Stagger({ children, className, delay = 0.08 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduceMotion ? 0 : delay } },
      }}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
