"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { CalendarDays } from "lucide-react";

export function MobileCtaBar({ fromLabel, price, perDay, href, label }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => setVisible(value > 520));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ y: 0 }}
          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-surface/95 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pl-4 pr-20 pt-3 shadow-2xl backdrop-blur lg:hidden"
          exit={{ y: "100%" }}
          initial={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {price ? (
            <p className="m-0 leading-tight">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
                {fromLabel}
              </span>
              <span className="font-display text-2xl text-foreground">
                {price}
              </span>
              <span className="ml-1 text-sm text-muted">/ {perDay}</span>
            </p>
          ) : (
            <span />
          )}
          <a
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-lg"
            href={href}
          >
            <CalendarDays aria-hidden="true" size={18} />
            {label}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}