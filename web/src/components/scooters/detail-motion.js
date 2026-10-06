"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

// Fade + slide up when the element enters the viewport (once)
export function FadeUp({ as = "div", children, className, delay = 0, y = 24 }) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </Tag>
  );
}

// Gentle continuous float (badges)
export function Float({ children, className, distance = 8, duration = 4 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -distance, 0] }}
      className={className}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// Decorative text that drifts slower than the page
export function ParallaxText({ children, className }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <motion.p
      aria-hidden="true"
      className={className}
      ref={ref}
      style={reduceMotion ? undefined : { y }}
    >
      {children}
    </motion.p>
  );
}

// Title whose words rise one by one
export function TitleReveal({ text, id, className = "", delay = 0.1 }) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <motion.h1
      animate="visible"
      className={className}
      id={id}
      initial="hidden"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: reduceMotion ? {} : { y: "110%", opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </motion.h1>
  );
}