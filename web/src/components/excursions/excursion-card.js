import Image from "next/image";
import { Check, Compass, MessageCircle, Route, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";

const WHATSAPP_NUMBER = "21628340240";

function imageSrc(image) {
  if (!image) return null;
  if (image.url) return image.url;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return image.publicId && cloudName
    ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_900/${image.publicId}`
    : null;
}

function priceAmount(tour) {
  const amount = Number(tour.price?.amount ?? tour.price);
  return Number.isFinite(amount) ? amount : null;
}

export async function ExcursionCard({ tour, locale, index }) {
  const t = await getTranslations("excursions");

  const amount = priceAmount(tour);
  const price =
    amount == null
      ? null
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency: tour.price?.currency ?? "EUR",
          maximumFractionDigits: 2,
          minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        }).format(amount);

  const unit = tour.price?.unit ?? "person";
  const unitLabel = t.has(`units.${unit}`) ? t(`units.${unit}`) : null;

  const typeLabel = t.has(`types.${tour.tourType}`)
    ? t(`types.${tour.tourType}`)
    : t("types.default");

  const places = Number(tour.capacityPerSlot);
  const src = imageSrc(tour.images?.[0]);
  const highlights = (tour.highlights ?? []).filter(Boolean).slice(0, 3);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t("whatsappMessage", { name: tour.name }),
  )}`;

  return (
    <Reveal as="li" className="list-none" delay={Math.min(index, 5) * 0.08}>
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
          {src ? (
            <Image
              alt={tour.name}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              fill
              priority={index < 3}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              src={src}
              unoptimized
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-full items-center justify-center bg-linear-to-br from-primary/25 via-surface-elevated to-accent/25"
            >
              <Route className="text-primary/40" size={84} strokeWidth={1.2} />
            </div>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent"
          />

          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-900 shadow backdrop-blur">
            <Compass aria-hidden="true" size={13} />
            {typeLabel}
          </span>

          {price && (
            <p className="absolute bottom-4 left-4 m-0 flex items-baseline gap-1.5 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">
              <span className="font-display text-3xl leading-none">{price}</span>
              {unitLabel && (
                <span className="text-sm font-medium opacity-90">
                  / {unitLabel}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h2 className="m-0 font-display text-2xl leading-tight text-foreground">
            {tour.name}
          </h2>

          {tour.tagline && (
            <p className="mb-0 mt-2 font-semibold text-secondary">
              {tour.tagline}
            </p>
          )}

          {tour.description && (
            <p className="mb-0 mt-3 whitespace-pre-line leading-relaxed text-muted">
              {tour.description}
            </p>
          )}

          {highlights.length > 0 && (
            <ul className="mb-0 mt-4 grid list-none gap-2 p-0">
              {highlights.map((highlight) => (
                <li className="flex items-start gap-2.5 text-sm" key={highlight}>
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check aria-hidden="true" size={12} strokeWidth={3} />
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-6">
            {Number.isFinite(places) && places > 0 && (
              <p className="m-0 mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted">
                <Users aria-hidden="true" size={16} />
                {t("placesPerDeparture", { count: places })}
              </p>
            )}

            <a
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-5 font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={18} />
              {t("bookWhatsapp")}
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}