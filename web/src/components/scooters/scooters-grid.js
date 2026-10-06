"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Bike, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import cloudinaryLoader from "@/lib/cloudinary-loader";

const GROUP_ORDER = ["50", "125", "electric"];

export function ScootersGrid({ items }) {
  const t = useTranslations("products");
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState("all");

  const groups = useMemo(
    () => GROUP_ORDER.filter((group) => items.some((i) => i.group === group)),
    [items],
  );
  const visible =
    active === "all" ? items : items.filter((item) => item.group === active);

  if (items.length === 0) {
    return (
      <p className="m-0 rounded-3xl border border-border bg-surface p-10 text-center text-lg text-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <>
      {groups.length > 1 && (
        <div
          aria-label={t("filterLabel")}
          className="mb-10 flex flex-wrap gap-2"
          role="group"
        >
          {["all", ...groups].map((group) => {
            const selected = active === group;
            return (
              <button
                aria-pressed={selected}
                className={`relative rounded-full border px-5 py-2.5 text-sm font-bold transition-colors ${
                  selected
                    ? "border-transparent text-primary-foreground"
                    : "border-border text-foreground hover:bg-surface-elevated"
                }`}
                key={group}
                onClick={() => setActive(group)}
                type="button"
              >
                {selected && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary"
                    layoutId="scooter-filter"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 30 }
                    }
                  />
                )}
                <span className="relative">
                  {group === "all"
                    ? t("filterAll")
                    : t(
                        group === "electric"
                          ? "categories.electric_scooter"
                          : "categories.scooter",
                      )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((item, index) => (
            <ScooterCard index={index} item={item} key={item.id} />
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}

function ScooterCard({ item, index }) {
  const t = useTranslations("products");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const price =
    item.fromPrice != null
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(item.fromPrice)
      : null;
  const Icon = item.group === "electric" ? Zap : Bike;
  const badge =
    item.group === "electric"
      ? t("specValues.fuel.electric")
      : item.engine;

  return (
    <motion.li
      animate={{ opacity: 1, y: 0 }}
      className="list-none"
      exit={{ opacity: 0, scale: 0.95 }}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      layout={!reduceMotion}
      transition={{
        duration: 0.5,
        delay: Math.min(index, 5) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.article
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-2xl has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        whileHover={reduceMotion ? undefined : { y: -8 }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
          {item.image ? (
            <Image
              alt=""
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              fill
              loader={item.image.cloudinary ? cloudinaryLoader : undefined}
              priority={index < 3}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              src={item.image.src}
              unoptimized={Boolean(item.image.remote)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/20 via-surface-elevated to-accent/20">
              <Icon
                aria-hidden="true"
                className="text-primary/40"
                size={72}
                strokeWidth={1.25}
              />
            </div>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
          />

          {badge && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-900 shadow backdrop-blur">
              <Icon aria-hidden="true" size={13} />
              {badge}
            </span>
          )}

          {price && (
            <p className="absolute bottom-4 left-4 m-0 flex items-baseline gap-1.5 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {t("fromPrice")}
              </span>
              <span className="font-display text-3xl leading-none">{price}</span>
              <span className="text-sm font-medium opacity-90">
                {t("perDay")}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h2 className="m-0 font-display text-2xl leading-tight text-foreground">
            <Link
              className="outline-none after:absolute after:inset-0"
              href={`/scooters/${item.slug}`}
            >
              {item.name}
            </Link>
          </h2>

          {item.description && (
            <p className="mb-0 mt-3 line-clamp-2 leading-relaxed text-muted">
              {item.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
              <Icon aria-hidden="true" size={16} />
              {t(`specValues.fuel.${item.fuel}`)}
            </span>
            <span className="inline-flex items-center gap-2 font-bold text-primary">
              {t("viewDetails")}
              <ArrowRight
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1.5"
                size={18}
              />
            </span>
          </div>
        </div>
      </motion.article>
    </motion.li>
  );
}