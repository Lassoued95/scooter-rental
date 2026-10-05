"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export function HeroSlider({ images, interval = 5500, children }) {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // effet de défilement : l'image bouge moins vite que la page, le texte s'estompe
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // changement automatique (désactivé si l'utilisateur réduit les animations)
  useEffect(() => {
    if (reduceMotion || images.length < 2) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % images.length),
      interval,
    );
    return () => clearTimeout(id);
  }, [index, interval, reduceMotion, images.length]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="welcome"
      className="relative flex min-h-[clamp(34rem,48vw,48rem)] items-center overflow-hidden bg-brand-section text-section-text max-sm:min-h-[min(88svh,54rem)] max-sm:items-end"
    >
      {/* images empilées, fondu enchaîné + léger zoom */}
      <motion.div
        aria-hidden={false}
        className="absolute inset-x-0 -top-[12%] -bottom-[12%]"
        style={reduceMotion ? undefined : { y: bgY }}
      >
        {images.map((img, i) => {
          const active = i === index;
          return (
            <motion.div
              key={img.src}
              aria-hidden={!active}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: active ? 1 : 0,
                scale: reduceMotion ? 1 : active ? 1 : 1.06,
              }}
              transition={{
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: active ? 7 : 1.2, ease: "easeOut" },
              }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-[70%_30%]"
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* dégradé léger, seulement pour la lisibilité */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-linear-to-t from-brand-section/90 via-brand-section/35 via-40% to-transparent"
      />

      {/* texte (envoyé par la page serveur) */}
      <motion.div
        className="relative z-20 mx-auto w-[calc(100%-2rem)] max-w-6xl pt-[clamp(3rem,8vh,6rem)] pb-[clamp(4.5rem,10vh,7rem)] max-sm:w-[calc(100%-1.25rem)]"
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* points de navigation avec barre de progression */}
      {images.length > 0.5 && (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-1">
          {images.map((img, i) => {
            const active = i === index;
            return (
              <button
                key={img.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1} / ${images.length}`}
                aria-current={active}
                className="flex h-6 items-center px-0.5"
              >
                <span
                  className={`relative block h-2 overflow-hidden rounded-full bg-white/45 transition-[width] duration-300 ${
                    active ? "w-12" : "w-2"
                  }`}
                >
                  {active &&
                    (reduceMotion ? (
                      <span className="absolute inset-0 bg-primary" />
                    ) : (
                      <motion.span
                        key={index}
                        className="absolute inset-0 origin-left bg-primary"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: interval / 1000, ease: "linear" }}
                      />
                    ))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}