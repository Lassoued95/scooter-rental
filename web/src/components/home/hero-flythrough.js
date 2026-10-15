"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

const HERO_SCREENS = 2.5; // hauteur totale du scroll du hero, en écrans

// Point de cadrage d'une image : une chaîne ("70% 30%") ou { mobile, desktop }
function focalPoints(position) {
  if (position && typeof position === "object") {
    return {
      mobile: position.mobile ?? position.desktop ?? "50% 50%",
      desktop: position.desktop ?? position.mobile ?? "50% 50%",
    };
  }
  const value = position ?? "70% 30%";
  return { mobile: value, desktop: value };
}

function focalStyle(position) {
  const { mobile, desktop } = focalPoints(position);
  return { "--pos-mobile": mobile, "--pos-desktop": desktop };
}

// Les variables CSS sont posées sur le conteneur de l'image et lues par l'image
const coverClass =
  "object-cover [object-position:var(--pos-mobile)] md:[object-position:var(--pos-desktop)]";

const pad = (n) => String(n).padStart(2, "0");

export function HeroFlythrough({ images, children }) {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? (
    <StaticHero images={images}>{children}</StaticHero>
  ) : (
    <ScrollHero images={images}>{children}</ScrollHero>
  );
}

/* Calques décoratifs partagés (voiles, halo, cadre) */
function HeroOverlays() {
  return (
    <>
      {/* voile du bas pour la lisibilité (plus fort sur mobile, où le texte est en bas) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-brand-section/75 via-transparent to-brand-section/25 max-sm:from-brand-section/95 max-sm:via-brand-section/35"
      />
      {/* voile latéral gauche : le texte reste lisible sur desktop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 hidden bg-linear-to-r from-brand-section/70 via-brand-section/20 to-transparent md:block"
      />
      {/* halo orange discret */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 z-10 size-[30rem] rounded-full bg-primary/25 blur-[120px]"
      />
      {/* cadre fin (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-5 z-10 hidden rounded-[2rem] border border-white/10 lg:block"
      />
    </>
  );
}

function ScrollHero({ images, children }) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);
  const count = images.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // lisse le scroll pour un effet d'inertie
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.4,
  });

  // image active (pour le compteur et les repères)
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setActive((current) => (current === next ? current : next));
  });

  const textOpacity = useTransform(progress, [0, 0.15, 0.8, 1], [1, 1, 1, 0]);
  const textY = useTransform(progress, [0, 1], [0, -60]);
  const vignetteOpacity = useTransform(progress, [0, 0.1, 0.9, 1], [0.4, 0.2, 0.2, 0.4]);
  const hintOpacity = useTransform(progress, [0, 0.08], [1, 0]);
  const chromeOpacity = useTransform(progress, [0, 0.05, 0.92, 1], [0, 1, 1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative isolate"
      style={{ height: `${HERO_SCREENS * 100}svh` }}
    >
      <div className="sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] w-full overflow-hidden bg-brand-section">
        {images.map((image, index) => (
          <FlythroughLayer
            key={image.src}
            image={image}
            index={index}
            count={count}
            progress={progress}
          />
        ))}

        {/* vignette */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgb(10 18 40 / 0.9) 100%)",
          }}
        />

        <HeroOverlays />

        {/* texte : centré sur ordinateur, en bas sur mobile */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center max-sm:items-end max-sm:pb-20"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl max-sm:w-[calc(100%-1.25rem)]">
            {children}
          </div>
        </motion.div>

        {/* compteur (bas gauche, desktop) */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-9 left-10 z-20 hidden items-end gap-3 text-white md:flex"
          style={{ opacity: chromeOpacity }}
        >
          <span className="font-display text-5xl font-black leading-none tracking-tight">
            {pad(active + 1)}
          </span>
          <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-white/60">
            <span className="h-px w-8 bg-white/40" />
            {pad(count)}
          </span>
        </motion.div>

        {/* repères verticaux (droite, desktop) */}
        <motion.ol
          aria-hidden="true"
          className="absolute right-9 top-1/2 z-20 m-0 hidden -translate-y-1/2 list-none flex-col items-center gap-3 p-0 md:flex"
          style={{ opacity: chromeOpacity }}
        >
          {images.map((image, index) => (
            <li
              className={`w-1 rounded-full transition-all duration-500 ${
                index === active
                  ? "h-12 bg-primary shadow-[0_0_14px_2px] shadow-primary/60"
                  : "h-5 bg-white/35"
              }`}
              key={image.src}
            />
          ))}
        </motion.ol>

        {/* indication de scroll */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2"
          style={{ opacity: hintOpacity }}
        >
          <div className="flex h-11 w-7 items-start justify-center rounded-full border border-white/60 bg-black/20 p-1.5 backdrop-blur-sm">
            <motion.span
              animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
              className="h-2.5 w-1 rounded-full bg-primary"
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* barre de progression */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/10"
        >
          <motion.div
            className="h-full origin-left bg-linear-to-r from-primary/70 via-primary to-primary shadow-[0_0_12px_2px] shadow-primary/50"
            style={{ scaleX: progress }}
          />
        </div>
      </div>
    </div>
  );
}

function FlythroughLayer({ image, index, count, progress }) {
  const segment = 1 / count;
  const start = index * segment;
  const end = start + segment;
  const overlap = segment * 0.35; // fondu enchaîné entre deux images

  // opacité : la première reste visible au début, la dernière jusqu'à la fin
  const input = [];
  const output = [];
  if (index === 0) {
    input.push(0);
    output.push(1);
  } else {
    input.push(start - overlap, start);
    output.push(0, 1);
  }
  if (index === count - 1) {
    input.push(1);
    output.push(1);
  } else {
    input.push(end - overlap, end + overlap);
    output.push(1, 0);
  }

  const zoomFrom = Math.max(start - overlap, 0);
  const zoomTo = Math.min(end + overlap, 1);

  const opacity = useTransform(progress, input, output);
  const scale = useTransform(progress, [zoomFrom, zoomTo], [1.05, 1.28]);
  const y = useTransform(progress, [zoomFrom, zoomTo], [0, -40]);

  return (
    <motion.div
      aria-hidden={image.alt ? undefined : true}
      className="absolute inset-0"
      style={{ opacity, ...focalStyle(image.position) }}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ scale, y }}
      >
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          fill
          priority={index === 0}
          sizes="100vw"
          className={coverClass}
        />
      </motion.div>
    </motion.div>
  );
}

// si le visiteur réduit les animations : image fixe, pas de scroll animé
function StaticHero({ images, children }) {
  const image = images[0];
  return (
    <div
      className="relative isolate flex min-h-[min(88svh,54rem)] items-center overflow-hidden bg-brand-section max-sm:items-end"
      style={focalStyle(image.position)}
    >
      <Image
        src={image.src}
        alt={image.alt ?? ""}
        fill
        priority
        sizes="100vw"
        className={coverClass}
      />
      <HeroOverlays />
      <div className="relative z-20 mx-auto w-[calc(100%-2rem)] max-w-6xl py-16 max-sm:w-[calc(100%-1.25rem)]">
        {children}
      </div>
    </div>
  );
}