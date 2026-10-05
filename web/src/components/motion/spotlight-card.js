"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

// Carte avec un halo qui suit la souris et un léger soulèvement au survol
export function SpotlightCard({ children, className = "" }) {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);
  const glow = useMotionTemplate`radial-gradient(340px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--primary) 24%, transparent), transparent 70%)`;

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-xl ${className}`}
      onMouseMove={reduceMotion ? undefined : handleMove}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}