"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/client";
import { getAvailability } from "@/lib/api/availability";
import { createReservation } from "@/lib/api/reservations";
import { todayInTunis } from "@/lib/cart/dates";

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ReservationForm({ productId, whatsappUrl, stock }) {
  const t = useTranslations("products");
  const locale = useLocale();
  const [today] = useState(todayInTunis);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [reference, setReference] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const validIsoDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = new Date(`${value}T00:00:00Z`);
      return (
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (
      !validIsoDate(startDate) ||
      !validIsoDate(endDate) ||
      startDate < today ||
      endDate < startDate
    ) {
      return undefined;
    }

    let active = true;
    const timer = setTimeout(() => {
      setAvailability({
        key: `${productId}|${startDate}|${endDate}`,
        state: "loading",
      });
      getAvailability(productId, startDate, endDate)
        .then((result) => {
          if (!result?.success || !Number.isFinite(Number(result.available))) {
            throw new Error("Invalid availability response.");
          }
          if (active) {
            setAvailability({
              key: `${productId}|${startDate}|${endDate}`,
              state: "available",
              count: Number(result.available),
            });
          }
        })
        .catch(() => {
          if (active) {
            setAvailability({
              key: `${productId}|${startDate}|${endDate}`,
              state: "error",
            });
          }
        });
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [endDate, productId, startDate, today]);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError(false);
    setAvailabilityError(false);
    setRateLimitError(false);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await createReservation({
        items: [
          {
            productId,
            quantity: Number(formData.get("quantity")),
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate"),
          },
        ],
        customer: {
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          hotel: formData.get("hotel") || undefined,
          message: formData.get("message") || undefined,
        },
        locale,
        termsAccepted: formData.get("termsAccepted") === "on",
        website: formData.get("website"),
      });
      setReference(response?.reservation?.reference ?? "");
      setSubmitted(true);
    } catch (submitError) {
      setAvailabilityError(
        submitError instanceof ApiError && submitError.status === 409,
      );
      setRateLimitError(
        submitError instanceof ApiError && submitError.status === 429,
      );
      setError(true);
    } finally {
      setPending(false);
    }
  }

  const maxQuantity =
    stock == null ? 10 : Math.max(1, Math.min(Number(stock), 10));
  const availabilityKey = `${productId}|${startDate}|${endDate}`;
  const currentAvailability =
    availability?.key === availabilityKey ? availability : null;

  return (
    <section
      aria-labelledby="reservation-title"
      className="rounded-3xl border border-border bg-surface p-6 shadow-lg"
      id="reservation"
    >
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarDays aria-hidden="true" size={22} />
      </span>
      <h2
        className="m-0 font-display text-2xl text-foreground"
        id="reservation-title"
      >
        {t("reservation.title")}
      </h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-muted">
        {t("reservation.intro")}
      </p>

      {submitted ? (
        <div
          aria-live="polite"
          className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-4 text-foreground"
          role="status"
        >
          <p className="mb-1 flex items-center gap-2 font-bold text-success">
            <CheckCircle2 aria-hidden="true" size={20} />
            {t("reservation.successTitle")}
          </p>
          <p className="mb-0 text-sm leading-6">
            {reference
              ? t("reservation.successReference", { reference })
              : t("reservation.successMessage")}
          </p>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-foreground">
              {t("reservation.startDate")}
              <input
                className={inputClass}
                min={today || undefined}
                name="startDate"
                onChange={(event) => setStartDate(event.target.value)}
                required
                type="date"
              />
            </label>
            <label className="text-sm font-semibold text-foreground">
              {t("reservation.endDate")}
              <input
                className={inputClass}
                min={startDate || today || undefined}
                name="endDate"
                onChange={(event) => setEndDate(event.target.value)}
                required
                type="date"
              />
            </label>
          </div>
          {currentAvailability && (
            <p
              aria-live="polite"
              className="m-0 text-sm font-semibold text-muted"
              role="status"
            >
              {currentAvailability.state === "loading"
                ? t("reservation.checkingAvailability")
                : currentAvailability.state === "error"
                  ? t("reservation.availabilityUnavailable")
                  : t("reservation.remaining", { count: currentAvailability.count })}
            </p>
          )}

          <label className="text-sm font-semibold text-foreground">
            {t("reservation.quantity")}
            <input
              className={inputClass}
              defaultValue="1"
              max={maxQuantity}
              min="1"
              name="quantity"
              required
              type="number"
            />
          </label>

          <label className="text-sm font-semibold text-foreground">
            {t("reservation.fullName")}
            <input
              autoComplete="name"
              className={inputClass}
              maxLength={120}
              name="fullName"
              required
              type="text"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-foreground">
              {t("reservation.email")}
              <input
                autoComplete="email"
                className={inputClass}
                maxLength={254}
                name="email"
                required
                type="email"
              />
            </label>
            <label className="text-sm font-semibold text-foreground">
              {t("reservation.phone")}
              <input
                autoComplete="tel"
                className={inputClass}
                maxLength={20}
                name="phone"
                required
                type="tel"
              />
            </label>
          </div>

          <label className="text-sm font-semibold text-foreground">
            {t("reservation.hotel")}
            <input
              autoComplete="organization"
              className={inputClass}
              maxLength={200}
              name="hotel"
              type="text"
            />
          </label>

          <label className="text-sm font-semibold text-foreground">
            {t("reservation.message")}
            <textarea
              className={`${inputClass} min-h-24 py-3`}
              maxLength={500}
              name="message"
              rows={3}
            />
          </label>

          <label className="sr-only" aria-hidden="true">
            Website
            <input
              autoComplete="off"
              name="website"
              tabIndex={-1}
              type="text"
            />
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-muted">
            <input
              className="mt-1 size-4 shrink-0 accent-primary"
              name="termsAccepted"
              required
              type="checkbox"
            />
            <span>{t("reservation.terms")}</span>
          </label>

          {error && (
            <p aria-live="polite" className="m-0 text-sm font-semibold text-error" role="alert">
              {availabilityError
                ? t("reservation.availabilityError")
                : rateLimitError
                  ? t("reservation.rateLimitError")
                : t("reservation.errorMessage")}
            </p>
          )}

          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            disabled={pending}
            type="submit"
          >
            {pending && (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            )}
            {pending ? t("reservation.submitting") : t("reservation.submit")}
          </button>
          <a
            className="text-center text-sm font-semibold text-muted underline decoration-border underline-offset-4 transition hover:text-foreground"
            href={whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            {t("reservation.whatsappAlternative")}
          </a>
        </form>
      )}
    </section>
  );
}
