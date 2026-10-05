"use client";

import { motion, useReducedMotion } from "motion/react";

// Bandeau de texte qui défile en boucle (décoratif)
export function Marquee({ items, className = "", duration = 30 }) {
  const reduceMotion = useReducedMotion();

  const row = (
    <ul className="m-0 flex shrink-0 list-none items-center gap-10 p-0 pr-10">
      {items.map((item) => (
        <li className="flex items-center gap-10 whitespace-nowrap" key={item}>
          <span>{item}</span>
          <span>✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div aria-hidden="true" className={`overflow-hidden ${className}`}>
      <motion.div
        animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
        className="flex w-max"
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {row}
        {row}
      </motion.div>
    </div>
  );
}