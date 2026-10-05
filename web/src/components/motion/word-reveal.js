"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

// Titre dont les mots montent un par un
export function WordReveal({ text, as = "h1", id, className = "", delay = 0.15 }) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      animate="visible"
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
    </Tag>
  );
}