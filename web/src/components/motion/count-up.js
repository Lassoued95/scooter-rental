"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useLocale } from "next-intl";

// Compteur qui monte quand il devient visible
export function CountUp({ to, from = 0, decimals = 0, suffix = "", duration = 1.6, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const locale = useLocale();

  const format = useCallback(
    (value) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: false,
      }).format(value) + suffix,
    [locale, decimals, suffix],
  );

  // avant l'animation : on affiche la valeur de départ
  useEffect(() => {
    if (!reduceMotion && ref.current) ref.current.textContent = format(from);
  }, [reduceMotion, format, from]);

  useEffect(() => {
    if (!inView || reduceMotion || !ref.current) return;
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate: (value) => {
        if (ref.current) ref.current.textContent = format(value);
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, from, to, duration, format]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}