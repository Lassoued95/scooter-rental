"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// La vidéo n'est téléchargée que lorsque la section est proche de l'écran,
// puis mise en pause quand elle n'est plus visible.
export function BackgroundVideo({ mp4, webm, poster, className = "" }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const [load, setLoad] = useState(false);
  const reduceMotion = useReducedMotion();

  // 1) on ne charge rien avant d'approcher de la section
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // 2) lecture quand la vidéo est visible, pause sinon
  useEffect(() => {
    const video = videoRef.current;
    if (!load || !video || reduceMotion) return;

    video.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [load, reduceMotion]);

  return (
    <div className={className} ref={wrapperRef}>
      {load && !reduceMotion && (
        <video
          aria-hidden="true"
          autoPlay
          className="size-full object-cover"
          disablePictureInPicture
          loop
          muted
          playsInline
          poster={poster}
          preload="auto"
          ref={videoRef}
        >
          {webm && <source src={webm} type="video/webm" />}
          <source src={mp4} type="video/mp4" />
        </video>
      )}
      {reduceMotion && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="size-full object-cover" src={poster} />
      )}
    </div>
  );
}