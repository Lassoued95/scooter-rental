"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Bike,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

export function DestinationsCarousel({ items, labels }) {
  const scrollerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  // progression du défilement horizontal (0 à 1)
  const { scrollXProgress } = useScroll({ container: scrollerRef });
  const progress = useSpring(scrollXProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
  });
  const markerLeft = useTransform(progress, [0, 1], ["0%", "100%"]);

  // carte active (pour le compteur)
  useMotionValueEvent(scrollXProgress, "change", (value) => {
    const next = Math.round(value * Math.max(items.length - 1, 0));
    setActive((current) => (current === next ? current : next));
  });

  function scrollByCard(direction) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector("[data-card]");
    const step = card
      ? card.getBoundingClientRect().width + 20
      : scroller.clientWidth * 0.8;
    scroller.scrollBy({
      left: direction * step,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div>
      {/* ---------- Cartes ---------- */}
      <div
        aria-label={labels.region}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100%-72rem)/2))] pb-8 pt-3 [scroll-padding-inline:max(1rem,calc((100%-72rem)/2))] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-scrollbar]:hidden"
        ref={scrollerRef}
        role="region"
        tabIndex={0}
      >
        {items.map((item, index) => (
          <article
            className="group relative aspect-[4/5] w-[78vw] max-w-[24rem] shrink-0 snap-start rounded-[1.75rem] bg-linear-to-br from-primary/60 via-border to-border p-px shadow-lg transition duration-500 hover:-translate-y-2 hover:from-primary hover:shadow-2xl hover:shadow-primary/20 sm:w-[21rem]"
            data-card
            key={item.key}
          >
            <div className="relative isolate h-full overflow-hidden rounded-[calc(1.75rem-1px)] bg-brand-section text-section-text">
              {/* Image / fond de secours */}
              {item.image ? (
                <Image
                  alt={item.imageAlt ?? ""}
                  className="-z-20 object-cover transition duration-700 ease-out group-hover:scale-110"
                  fill
                  sizes="(min-width: 640px) 21rem, 78vw"
                  src={item.image}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-20 bg-linear-to-br from-secondary via-brand-section to-primary/60"
                >
                  <MapPin
                    className="absolute -right-6 -top-6 size-48 text-white/10"
                    strokeWidth={1}
                  />
                </div>
              )}

              {/* Voiles de lisibilité */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-linear-to-t from-brand-section via-brand-section/55 to-transparent"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 -z-10 h-28 bg-linear-to-b from-black/40 to-transparent"
              />
              {/* Halo orange au survol */}
              <div
                aria-hidden="true"
                className="absolute -bottom-16 -left-16 -z-10 size-56 rounded-full bg-primary/0 blur-3xl transition duration-500 group-hover:bg-primary/30"
              />

              <div className="flex h-full flex-col justify-between p-6">
                {/* Haut : numéro + étiquette */}
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 font-display text-sm font-bold tracking-widest backdrop-blur-md">
                    {pad(index + 1)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-md">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                    {item.tag}
                  </span>
                </div>

                {/* Bas : titre + texte */}
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="m-0 font-display text-3xl font-bold leading-tight [text-shadow:0_2px_16px_rgb(0_0_0/0.5)]">
                      {item.name}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="mb-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg shadow-primary/40 transition duration-300 group-hover:rotate-0 group-hover:opacity-100 -rotate-45"
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="mt-3 block h-1 w-10 rounded-full bg-primary transition-all duration-500 group-hover:w-24"
                  />

                  <p className="mb-0 mt-3 line-clamp-3 text-[15px] leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0/0.5)]">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ---------- Route + compteur + flèches ---------- */}
      <div className="mx-auto mt-2 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-5">
        {/* Compteur */}
        <p
          aria-hidden="true"
          className="m-0 hidden shrink-0 items-baseline gap-1 font-display sm:flex"
        >
          <span className="text-3xl font-bold text-secondary">
            {pad(active + 1)}
          </span>
          <span className="text-sm font-semibold text-muted">
            / {pad(items.length)}
          </span>
        </p>

        {/* Piste */}
        <div aria-hidden="true" className="relative h-10 flex-1 px-4">
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border" />
          <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full">
            <motion.div
              className="h-full w-full origin-left bg-linear-to-r from-primary/40 to-primary"
              style={reduceMotion ? { scaleX: 0 } : { scaleX: progress }}
            />
          </div>
          <motion.span
            className="absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background"
            style={reduceMotion ? { left: "0%" } : { left: markerLeft }}
          >
            <Bike size={18} />
          </motion.span>
        </div>

        {/* Flèches */}
        <div className="flex gap-2">
          <button
            aria-label={labels.prev}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 focus-visible:border-primary active:scale-95"
            onClick={() => scrollByCard(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <button
            aria-label={labels.next}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 focus-visible:border-primary active:scale-95"
            onClick={() => scrollByCard(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}