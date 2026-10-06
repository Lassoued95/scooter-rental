"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, MessageCircle } from "lucide-react";
import { whatsappCtaClass } from "@/components/scooters/cta";

export function PricingCard({ title, tiers, singlePrice, perDay, trust, cta }) {
  const reduceMotion = useReducedMotion();

  return (
    <aside
      aria-labelledby="pricing-title"
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-xl lg:sticky lg:top-28"
      id="pricing"
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-2xl"
      />

      <h2
        className="relative m-0 font-display text-2xl text-foreground"
        id="pricing-title"
      >
        {title}
      </h2>

      {tiers.length > 0 && (
        <ul className="relative mb-0 mt-6 grid list-none gap-5 p-0">
          {tiers.map((tier, i) => (
            <li key={tier.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                  {tier.label}
                  {tier.saving > 0 && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
                      −{tier.saving}%
                    </span>
                  )}
                </span>
                <span className="font-display text-2xl text-foreground">
                  {tier.price}
                  <span className="ml-1 text-sm font-medium text-muted">
                    / {perDay}
                  </span>
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ scaleX: reduceMotion ? tier.ratio : 0 }}
                  style={{ originX: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{ once: true }}
                  whileInView={{ scaleX: tier.ratio }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {singlePrice && (
        <p className="relative mb-0 mt-6 font-display text-4xl text-foreground">
          {singlePrice}
          <span className="ml-2 text-base font-medium text-muted">
            / {perDay}
          </span>
        </p>
      )}

      <ul className="relative mb-0 mt-6 grid list-none gap-2.5 border-t border-border p-0 pt-5">
        {trust.map((item) => (
          <li
            className="flex items-center gap-2.5 text-sm font-semibold"
            key={item}
          >
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-success/15 text-success">
              <Check aria-hidden="true" size={13} strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <a
        className={`${whatsappCtaClass} mt-6 w-full`}
        href={cta.href}
        rel="noreferrer"
        target="_blank"
      >
        <MessageCircle aria-hidden="true" size={19} />
        <span className="relative">{cta.label}</span>
      </a>
    </aside>
  );
}