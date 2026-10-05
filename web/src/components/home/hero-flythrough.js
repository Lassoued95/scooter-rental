"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

const HERO_SCREENS = 2.5; // hauteur totale du scroll du hero, en écrans

export function HeroFlythrough({ images, children }) {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? (
    <StaticHero images={images}>{children}</StaticHero>
  ) : (
    <ScrollHero images={images}>{children}</ScrollHero>
  );
}

function ScrollHero({ images, children }) {
  const containerRef = useRef(null);

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

  const textOpacity = useTransform(progress, [0, 0.15, 0.8, 1], [1, 1, 1, 0]);
  const textY = useTransform(progress, [0, 1], [0, -60]);
  const vignetteOpacity = useTransform(progress, [0, 0.1, 0.9, 1], [0.4, 0.2, 0.2, 0.4]);
  const hintOpacity = useTransform(progress, [0, 0.08], [1, 0]);

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
            count={images.length}
            progress={progress}
          />
        ))}

        {/* vignette légère */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgb(10 18 40 / 0.9) 100%)",
          }}
        />

        {/* léger voile en bas pour la lisibilité */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-brand-section/55 via-transparent to-brand-section/10"
        />

        {/* texte */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl max-sm:w-[calc(100%-1.25rem)]">
            {children}
          </div>
        </motion.div>

        {/* indication de scroll */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
          style={{ opacity: hintOpacity }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-8 w-5 items-start justify-center rounded-full border border-white/60 p-1"
          >
            <div className="h-2 w-1 rounded-full bg-white/85" />
          </motion.div>
        </motion.div>

        {/* barre de progression */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-20 h-1 origin-left bg-primary"
          style={{ scaleX: progress }}
        />
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
      style={{ opacity }}
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
          className="object-cover"
          style={{ objectPosition: image.position ?? "70% 30%" }}
        />
      </motion.div>
    </motion.div>
  );
}

// si le visiteur réduit les animations : image fixe, pas de scroll animé
function StaticHero({ images, children }) {
  const image = images[0];
  return (
    <div className="relative isolate flex min-h-[min(88svh,54rem)] items-center overflow-hidden bg-brand-section">
      <Image
        src={image.src}
        alt={image.alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: image.position ?? "70% 30%" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-brand-section/70 via-transparent to-transparent"
      />
      <div className="relative z-10 mx-auto w-[calc(100%-2rem)] max-w-6xl py-16">
        {children}
      </div>
    </div>
  );
}