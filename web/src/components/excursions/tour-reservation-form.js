"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/client";
import { createReservation } from "@/lib/api/reservations";
import { todayInTunis } from "@/lib/cart/dates";

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export function TourReservationForm({ productId, whatsappUrl }) {
  const t = useTranslations("excursions");
  const tp = useTranslations("products");
  const locale = useLocale();
  const [today] = useState(todayInTunis);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null); // null | { reference }
  const [errorKey, setErrorKey] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setErrorKey("");

    const formData = new FormData(event.currentTarget);
    try {
      const response = await createReservation({
        items: [
          {
            productId,
            quantity: Number(formData.get("quantity")),
            date: formData.get("date"),
            departureTime: formData.get("departureTime"),
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

      setResult({
        reference:
          response?.reservation?.reference ?? response?.reference ?? null,
      });
    } catch (submitError) {
      const status = submitError instanceof ApiError ? submitError.status : 0;
      setErrorKey(
        status === 429 ? "rateLimitError" : "errorMessage",
      );
    } finally {
      setPending(false);
    }
  }

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

      {result ? (
        <div
          aria-live="polite"
          className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-4 text-foreground"
          role="status"
        >
          <p className="mb-1 flex items-center gap-2 font-bold text-success">
            <CheckCircle2 aria-hidden="true" size={20} />
            {tp("reservation.successTitle")}
          </p>
          <p className="mb-0 text-sm leading-6">
            {result.reference
              ? tp("reservation.successReference", { reference: result.reference })
              : tp("reservation.successMessage")}
          </p>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-foreground">
              {t("reservation.date")}
              <input
                className={inputClass}
                min={today || undefined}
                name="date"
                required
                type="date"
              />
            </label>
            <label className="text-sm font-semibold text-foreground">
              {t("reservation.departureTime")}
              <select
                className={inputClass}
                defaultValue=""
                name="departureTime"
                required
              >
                <option disabled value="">
                  {t("reservation.selectDepartureTime")}
                </option>
                <option value="08:00">08:00</option>
                <option value="14:00">14:00</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-foreground sm:col-span-2">
              {t("reservation.participants")}
              <input
                className={inputClass}
                defaultValue="1"
                min="1"
                name="quantity"
                required
                type="number"
              />
            </label>
          </div>

          <label className="text-sm font-semibold text-foreground">
            {tp("reservation.fullName")}
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
              {tp("reservation.email")}
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
              {tp("reservation.phone")}
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
            {tp("reservation.hotel")}
            <input
              autoComplete="organization"
              className={inputClass}
              maxLength={200}
              name="hotel"
              type="text"
            />
          </label>

          <label className="text-sm font-semibold text-foreground">
            {tp("reservation.message")}
            <textarea
              className={`${inputClass} min-h-24 py-3`}
              maxLength={500}
              name="message"
              rows={3}
            />
          </label>

          <label aria-hidden="true" className="sr-only">
            Website
            <input autoComplete="off" name="website" tabIndex={-1} type="text" />
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-muted">
            <input
              className="mt-1 size-4 shrink-0 accent-primary"
              name="termsAccepted"
              required
              type="checkbox"
            />
            <span>{tp("reservation.terms")}</span>
          </label>

          {errorKey && (
            <p
              aria-live="polite"
              className="m-0 text-sm font-semibold text-error"
              role="alert"
            >
              {tp(`reservation.${errorKey}`)}
            </p>
          )}

          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-lg transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            disabled={pending}
            type="submit"
          >
            {pending && (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            )}
            {pending ? tp("reservation.submitting") : tp("reservation.submit")}
          </button>
          <a
            className="text-center text-sm font-semibold text-muted underline decoration-border underline-offset-4 transition hover:text-foreground"
            href={whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            {tp("reservation.whatsappAlternative")}
          </a>
        </form>
      )}
    </section>
  );
}