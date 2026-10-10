"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { AdminLoginCard } from "@/components/admin/admin-login-card";
import { adminErrorMessage, adminRequest } from "@/lib/admin/admin-request";
import { useAdminSession } from "@/lib/admin/use-admin-session";

const PAGE_SIZE = 20;

const STATUS = {
  PENDING: { label: "En attente", badge: "bg-primary/15 text-primary" },
  CONFIRMED: { label: "Confirmée", badge: "bg-success-background text-success" },
  CANCELLED: { label: "Annulée", badge: "bg-error-background text-error" },
  COMPLETED: { label: "Terminée", badge: "bg-surface-elevated text-muted" },
};

const TABS = [
  { value: "", label: "Toutes", count: "all" },
  { value: "PENDING", label: "En attente", count: "PENDING" },
  { value: "CONFIRMED", label: "Confirmées", count: "CONFIRMED" },
  { value: "COMPLETED", label: "Terminées", count: "COMPLETED" },
  { value: "CANCELLED", label: "Annulées", count: "CANCELLED" },
];

// Message d'accueil dans la langue du client (un message court, modifiable avant l'envoi)
const WHATSAPP_GREETING = {
  fr: (name, ref) => `Bonjour ${name}, c'est Location Scooter Djerba au sujet de votre réservation ${ref}.`,
  en: (name, ref) => `Hello ${name}, this is Location Scooter Djerba about your reservation ${ref}.`,
  de: (name, ref) => `Hallo ${name}, hier ist Location Scooter Djerba zu Ihrer Reservierung ${ref}.`,
  it: (name, ref) => `Buongiorno ${name}, siamo Location Scooter Djerba per la tua prenotazione ${ref}.`,
  pl: (name, ref) => `Dzień dobry ${name}, tu Location Scooter Djerba w sprawie rezerwacji ${ref}.`,
  pt: (name, ref) => `Olá ${name}, é a Location Scooter Djerba sobre a sua reserva ${ref}.`,
};

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDay = (iso) => (iso ? dayFormat.format(new Date(`${iso}T00:00:00Z`)) : "");
const formatDateTime = (iso) => (iso ? dateTimeFormat.format(new Date(iso)) : "");

function formatMoney(amount, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    Number(amount) || 0,
  );
}

function countDays(start, end) {
  const diff = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000;
  return Number.isFinite(diff) && diff >= 0 ? Math.round(diff) + 1 : 0;
}

function whatsappNumber(phone) {
  const cleaned = String(phone ?? "").replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (/^\d{8}$/.test(cleaned)) return `216${cleaned}`; // numéro tunisien à 8 chiffres
  return cleaned;
}

function StatusBadge({ status }) {
  const info = STATUS[status] ?? { label: status, badge: "bg-surface-elevated text-muted" };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${info.badge}`}>
      {info.label}
    </span>
  );
}

function ReservationDialog({ busy, onClose, onStatus, reservation }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const { customer } = reservation;
  const days = countDays(reservation.startDate, reservation.endDate);
  const greeting = (WHATSAPP_GREETING[reservation.locale] ?? WHATSAPP_GREETING.en)(
    customer.name,
    reservation.reference,
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber(customer.phone)}?text=${encodeURIComponent(greeting)}`;

  const actions = {
    PENDING: [
      { to: "CONFIRMED", label: "Confirmer", primary: true },
      { to: "CANCELLED", label: "Refuser", danger: true },
    ],
    CONFIRMED: [
      { to: "COMPLETED", label: "Marquer terminée", primary: true },
      { to: "CANCELLED", label: "Annuler", danger: true },
    ],
  }[reservation.status] ?? [];

  function handleAction(action) {
    if (
      action.to === "CANCELLED" &&
      !window.confirm("Annuler cette réservation ? Le véhicule sera de nouveau disponible pour ces dates.")
    ) {
      return;
    }
    onStatus(reservation.id, action.to);
  }

  const rows = [
    ["Véhicule", `${reservation.productName} × ${reservation.quantity}`],
    [
      "Dates",
      `${formatDay(reservation.startDate)} → ${formatDay(reservation.endDate)} (${days} jour${days > 1 ? "s" : ""})`,
    ],
    ["Total", formatMoney(reservation.totalPrice, reservation.currency)],
    ["Hôtel (prise en charge)", customer.hotel || "Non précisé"],
    ["Reçue le", formatDateTime(reservation.createdAt)],
    ["Langue du client", reservation.locale.toUpperCase()],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-labelledby="reservation-dialog-title"
        aria-modal="true"
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-surface shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Réservation {reservation.reference}
            </p>
            <h2 className="mb-0 mt-1 font-display text-2xl" id="reservation-dialog-title">
              {customer.name}
            </h2>
            <div className="mt-2">
              <StatusBadge status={reservation.status} />
            </div>
          </div>
          <button
            aria-label="Fermer la fiche"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border hover:bg-surface-elevated"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="grid gap-6 p-5">
          <dl className="m-0 grid gap-3">
            {rows.map(([label, value]) => (
              <div className="grid grid-cols-[9rem_1fr] gap-3 text-sm" key={label}>
                <dt className="text-muted">{label}</dt>
                <dd className="m-0 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {customer.message && (
            <div>
              <h3 className="m-0 text-sm font-bold">Message du client</h3>
              <p className="mb-0 mt-2 whitespace-pre-line rounded-xl bg-background p-4 text-sm leading-6">
                {customer.message}
              </p>
            </div>
          )}

          <div>
            <h3 className="m-0 text-sm font-bold">Contacter le client</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                className="flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-bold text-primary-foreground"
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={17} />
                WhatsApp
              </a>
              <a
                className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-surface-elevated"
                href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}
              >
                <Phone aria-hidden="true" size={17} />
                {customer.phone}
              </a>
              <a
                className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-surface-elevated"
                href={`mailto:${customer.email}`}
              >
                <Mail aria-hidden="true" size={17} />
                E-mail
              </a>
            </div>
          </div>

          {reservation.history.length > 0 && (
            <div>
              <h3 className="m-0 text-sm font-bold">Historique</h3>
              <ul className="mb-0 mt-3 grid list-none gap-2 p-0 text-sm text-muted">
                {reservation.history.map((entry, index) => (
                  <li key={`${entry.at}-${index}`}>
                    {formatDateTime(entry.at)} : {STATUS[entry.status]?.label ?? entry.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="sticky bottom-0 mt-auto flex flex-wrap gap-3 border-t border-border bg-surface p-5">
            {actions.map((action) => (
              <button
                className={`min-h-12 flex-1 rounded-full px-5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-error/40 text-error hover:bg-error-background"
                }`}
                disabled={busy}
                key={action.to}
                onClick={() => handleAction(action)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminReservationsManager() {
  const { user, status, error: sessionError, login, logout } = useAdminSession();

  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const requestKey = `${filter}|${debouncedQuery}|${page}|${reloadToken}`;
  const loading = result.key !== requestKey;

  // recherche : on attend la fin de la saisie avant d'interroger l'API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // chargement de la liste
  useEffect(() => {
    if (status !== "admin" || !user) return;
    let cancelled = false;

    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (filter) params.set("status", filter);
    if (debouncedQuery) params.set("q", debouncedQuery);

    adminRequest(user, `/api/admin/reservations?${params}`)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: "" });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setResult({ key: requestKey, data: null, error: adminErrorMessage(requestError.message) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status, user, filter, debouncedQuery, page, requestKey]);

  // actualisation automatique toutes les 60 secondes
  useEffect(() => {
    if (status !== "admin") return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") setReloadToken((token) => token + 1);
    }, 60_000);
    return () => clearInterval(timer);
  }, [status]);

  async function changeStatus(id, nextStatus) {
    setBusy(true);
    setActionError("");
    setNotice("");
    try {
      const response = await adminRequest(user, `/api/admin/reservations/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setSelectedId(null);
      setReloadToken((token) => token + 1);

      if (nextStatus === "CONFIRMED" || nextStatus === "CANCELLED") {
        setNotice(
          response.emailSent
            ? "Statut mis à jour. Un e-mail a été envoyé au client."
            : "Statut mis à jour, mais l’e-mail n’a pas pu être envoyé : prévenez le client par WhatsApp.",
        );
      } else {
        setNotice("Statut mis à jour.");
      }
    } catch (requestError) {
      setActionError(adminErrorMessage(requestError.message));
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <p className="flex items-center gap-3 text-muted" role="status">
        <span className="size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
        Vérification de l’accès administrateur…
      </p>
    );
  }

  if (status !== "admin") {
    return (
      <AdminLoginCard
        error={sessionError}
        onLogin={login}
        onLogout={logout}
        signedIn={Boolean(user)}
      />
    );
  }

  const data = result.data;
  const reservations = data?.reservations ?? [];
  const selected = reservations.find((reservation) => reservation.id === selectedId) ?? null;
  const total = data?.total ?? 0;
  const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, total);
  const hasNext = page * PAGE_SIZE < total;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Demandes de location
              </p>
              <h2 className="m-0 font-display text-2xl font-bold">Réservations</h2>
              <p className="mb-0 mt-1 text-sm text-muted">
                {data
                  ? `${data.counts.PENDING} demande${data.counts.PENDING > 1 ? "s" : ""} en attente`
                  : "Chargement…"}
              </p>
            </div>
            <button
              aria-label="Actualiser la liste"
              className="flex size-11 items-center justify-center rounded-full border border-border transition hover:bg-surface-elevated"
              onClick={() => setReloadToken((token) => token + 1)}
              title="Actualiser la liste"
              type="button"
            >
              <RefreshCw aria-hidden="true" className={loading ? "animate-spin" : ""} size={17} />
            </button>
          </div>

          <div
            aria-label="Filtrer par statut"
            className="mt-5 flex flex-wrap gap-2"
            role="tablist"
          >
            {TABS.map((tab) => {
              const active = filter === tab.value;
              return (
                <button
                  aria-selected={active}
                  className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface hover:bg-surface-elevated"
                  }`}
                  key={tab.value || "all"}
                  onClick={() => {
                    setFilter(tab.value);
                    setPage(1);
                  }}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                  <span className="text-xs opacity-80">{data?.counts?.[tab.count] ?? "–"}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search aria-hidden="true" className="shrink-0 text-muted" size={18} />
            <span className="sr-only">Rechercher une réservation</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, téléphone, e-mail, référence, hôtel…"
              type="search"
              value={query}
            />
          </label>
        </div>

        {(result.error || actionError) && (
          <p className="mx-5 mt-4 rounded-xl bg-error-background p-4 text-sm text-error sm:mx-6" role="alert">
            {actionError || result.error}
          </p>
        )}
        {notice && (
          <p className="mx-5 mt-4 rounded-xl bg-success-background p-4 text-sm text-success sm:mx-6" role="status">
            {notice}
          </p>
        )}

        <ul
          className={`m-0 grid list-none gap-3 p-4 transition-opacity sm:p-5 ${loading ? "opacity-60" : ""}`}
        >
          {reservations.map((reservation) => (
            <li key={reservation.id}>
              <button
                className="grid w-full gap-3 rounded-2xl border border-border/70 bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[1fr_auto]"
                onClick={() => setSelectedId(reservation.id)}
                type="button"
              >
                <span className="grid gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold">{reservation.customer.name}</span>
                    <StatusBadge status={reservation.status} />
                  </span>
                  <span className="text-sm text-foreground">
                    {reservation.productName} × {reservation.quantity}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays aria-hidden="true" size={15} />
                      {formatDay(reservation.startDate)} → {formatDay(reservation.endDate)}
                    </span>
                    {reservation.customer.hotel && <span>{reservation.customer.hotel}</span>}
                  </span>
                </span>
                <span className="grid content-between gap-2 text-left sm:text-right">
                  <span className="font-display text-xl">
                    {formatMoney(reservation.totalPrice, reservation.currency)}
                  </span>
                  <span className="text-xs text-muted">
                    {reservation.reference} · {formatDateTime(reservation.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}

          {!loading && reservations.length === 0 && !result.error && (
            <li className="rounded-2xl bg-background px-4 py-10 text-center text-sm text-muted">
              {debouncedQuery || filter
                ? "Aucune réservation ne correspond à ces critères."
                : "Aucune réservation pour le moment."}
            </li>
          )}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4 sm:px-6">
          <span className="text-xs text-muted">
            {total > 0 ? `${firstItem}–${lastItem} sur ${total}` : "0 résultat"}
            {data?.truncated && " · affichage limité aux 300 plus récentes"}
          </span>
          <div className="flex gap-2">
            <button
              className="min-h-10 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-elevated disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              type="button"
            >
              Précédent
            </button>
            <button
              className="min-h-10 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-elevated disabled:opacity-40"
              disabled={!hasNext}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Suivant
            </button>
          </div>
        </div>
      </section>

      <p className="m-0 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span className="truncate">Connecté en tant que {user.email}</span>
        <button
          className="min-h-10 rounded-full border border-border px-3 font-semibold transition hover:bg-surface-elevated"
          onClick={() => void logout()}
          type="button"
        >
          Déconnexion
        </button>
      </p>

      {selected && (
        <ReservationDialog
          busy={busy}
          onClose={() => setSelectedId(null)}
          onStatus={changeStatus}
          reservation={selected}
        />
      )}
    </div>
  );
}