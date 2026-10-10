"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

// Trait vertical qui se remplit pendant le défilement
export function StepsTimeline({ children }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.3,
  });

  return (
    <div className="relative" ref={ref}>
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-6 top-0 w-0.5 -translate-x-1/2 bg-border md:left-1/2"
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-6 top-0 w-0.5 origin-top -translate-x-1/2 bg-primary md:left-1/2"
        style={{ scaleY: reduceMotion ? 1 : scaleY }}
      />
      {children}
    </div>
  );
}