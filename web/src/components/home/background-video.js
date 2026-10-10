"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

// Fond vidéo : sans son, en boucle, en pause quand il n'est pas à l'écran.
// Si le visiteur a réduit les animations : la vidéo reste sur sa première image.
export function BackgroundVideo({ mp4, webm, poster, className = "" }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion) return;

    video.muted = true; // certains navigateurs exigent la propriété, pas seulement l'attribut

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <video
      aria-hidden="true"
      autoPlay={!reduceMotion}
      className={`object-cover ${className}`}
      disablePictureInPicture
      loop={!reduceMotion}
      muted
      playsInline
      poster={poster}
      preload="metadata"
      ref={ref}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}