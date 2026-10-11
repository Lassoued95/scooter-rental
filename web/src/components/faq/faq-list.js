"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

// Filtres par thème + accordéon accessible (un seul élément ouvert à la fois)
export function FaqList({ allLabel, filterLabel, groups, items }) {
  const [active, setActive] = useState("all");
  const [openId, setOpenId] = useState(items[0]?.id ?? null);
  const reduceMotion = useReducedMotion();
  const baseId = useId();

  const visible =
    active === "all" ? items : items.filter((item) => item.group === active);
  // si l'élément ouvert n'est plus visible après un filtre, rien n'est ouvert
  const currentOpen = visible.some((item) => item.id === openId) ? openId : null;

  const filters = [{ id: "all", label: allLabel }, ...groups];

  return (
    <div>
      <div
        aria-label={filterLabel}
        className="flex flex-wrap gap-2"
        role="group"
      >
        {filters.map((filter) => {
          const selected = active === filter.id;
          return (
            <button
              aria-pressed={selected}
              className={`min-h-11 rounded-full border px-5 text-sm font-bold transition ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-elevated"
              }`}
              key={filter.id}
              onClick={() => setActive(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <ul className="m-0 mt-8 grid list-none gap-3 p-0">
        {visible.map((item) => {
          const isOpen = currentOpen === item.id;
          const buttonId = `${baseId}-${item.id}-button`;
          const panelId = `${baseId}-${item.id}-panel`;

          return (
            <li
              className={`overflow-hidden rounded-2xl border bg-surface transition-colors duration-300 ${
                isOpen ? "border-primary/50 shadow-md" : "border-border"
              }`}
              key={item.id}
            >
              <h2 className="m-0">
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg text-foreground transition hover:text-primary focus-visible:text-primary sm:text-xl"
                  id={buttonId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  type="button"
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                      isOpen
                        ? "rotate-45 bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Plus size={18} />
                  </span>
                </button>
              </h2>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    animate={{ height: "auto", opacity: 1 }}
                    aria-labelledby={buttonId}
                    className="overflow-hidden"
                    exit={
                      reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                    }
                    id={panelId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    key="panel"
                    role="region"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <p className="m-0 max-w-2xl px-5 pb-6 leading-7 text-muted">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}