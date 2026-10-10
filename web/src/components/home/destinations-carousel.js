"use client";

import { useRef } from "react";
import Image from "next/image";
import { Bike, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

export function DestinationsCarousel({ items, labels }) {
  const scrollerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // progression du défilement horizontal (0 à 1)
  const { scrollXProgress } = useScroll({ container: scrollerRef });
  const progress = useSpring(scrollXProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
  });
  const markerLeft = useTransform(progress, [0, 1], ["0%", "100%"]);

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

  return (
    <div>
      {/* Cartes */}
      <div
        aria-label={labels.region}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100%-72rem)/2))] pb-6 pt-2 [scroll-padding-inline:max(1rem,calc((100%-72rem)/2))] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-scrollbar]:hidden"
        ref={scrollerRef}
        role="region"
        tabIndex={0}
      >
        {items.map((item, index) => (
          <article
            className="group relative isolate aspect-[4/5] w-[78vw] max-w-[24rem] shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-brand-section text-section-text shadow-lg sm:w-[21rem]"
            data-card
            key={item.key}
          >
            {item.image ? (
              <Image
                alt={item.imageAlt ?? ""}
                className="-z-20 object-cover transition duration-700 group-hover:scale-105"
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

            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-t from-brand-section/95 via-brand-section/40 to-transparent"
            />

            <div className="flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold tracking-[0.2em] text-white/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur">
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="m-0 font-display text-3xl leading-tight [text-shadow:0_2px_16px_rgb(0_0_0/0.5)]">
                  {item.name}
                </h3>
                <p className="mb-0 mt-3 leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0/0.5)]">
                  {item.text}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Route + flèches */}
      <div className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-4">
        <div aria-hidden="true" className="relative h-8 flex-1 px-3">
          <div className="absolute inset-x-3 top-1/2 border-t-2 border-dashed border-border" />
          <motion.span
            className="absolute top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            style={reduceMotion ? { left: "0%" } : { left: markerLeft }}
          >
            <Bike size={16} />
          </motion.span>
        </div>

        <div className="flex gap-2">
          <button
            aria-label={labels.prev}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface transition hover:bg-surface-elevated"
            onClick={() => scrollByCard(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <button
            aria-label={labels.next}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface transition hover:bg-surface-elevated"
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