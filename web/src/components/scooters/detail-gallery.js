"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

export function DetailGallery({ images, labels }) {
  const reduceMotion = useReducedMotion();
  const [[index, direction], setPage] = useState([0, 0]);
  const count = images.length;
  const image = images[index];

  const paginate = useCallback(
    (step) =>
      setPage(([current]) => [(current + step + count) % count, step]),
    [count],
  );
  const goTo = useCallback(
    (next) => setPage(([current]) => [next, next > current ? 1 : -1]),
    [],
  );

  const variants = {
    enter: (dir) => ({
      opacity: 0,
      x: reduceMotion ? 0 : dir * 48,
      scale: reduceMotion ? 1 : 1.04,
    }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -48 }),
  };

  function onKeyDown(event) {
    if (count < 2) return;
    if (event.key === "ArrowRight") paginate(1);
    if (event.key === "ArrowLeft") paginate(-1);
  }

  const arrowClass =
    "absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary lg:opacity-0 lg:group-hover:opacity-100";

  return (
    <div
      aria-label={labels.region}
      aria-roledescription="carousel"
      className="grid gap-4"
      role="group"
    >
      <div
        className="group relative aspect-[4/3] touch-pan-y overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            animate="center"
            className={`absolute inset-0 ${count > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
            custom={direction}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            exit="exit"
            initial="enter"
            key={image.src}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) paginate(1);
              else if (info.offset.x > 60) paginate(-1);
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            variants={variants}
          >
            <Image
              alt={image.alt}
              className="pointer-events-none object-cover"
              draggable={false}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 55vw, 100vw"
              src={image.src}
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/50 to-transparent"
        />

        {count > 1 && (
          <>
            <button
              aria-label={labels.prev}
              className={`${arrowClass} left-3`}
              onClick={() => paginate(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={22} />
            </button>
            <button
              aria-label={labels.next}
              className={`${arrowClass} right-3`}
              onClick={() => paginate(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={22} />
            </button>
            <p
              aria-live="polite"
              className="absolute bottom-4 right-4 m-0 rounded-full bg-black/40 px-3 py-1 text-xs font-bold tracking-[0.18em] text-white backdrop-blur"
            >
              {pad(index + 1)} / {pad(count)}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="m-0 flex list-none gap-3 overflow-x-auto p-0 pb-1">
          {images.map((item, i) => {
            const active = i === index;
            return (
              <li className="shrink-0" key={item.src}>
                <button
                  aria-current={active}
                  aria-label={`${i + 1} / ${count}`}
                  className={`relative block aspect-[4/3] w-20 overflow-hidden rounded-xl transition-opacity sm:w-24 ${
                    active ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => goTo(i)}
                  type="button"
                >
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="96px"
                    src={item.src}
                    unoptimized
                  />
                  {active && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl ring-2 ring-inset ring-primary"
                      layoutId="detail-thumb-ring"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}