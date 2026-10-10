"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AdminLoginCard } from "@/components/admin/admin-login-card";
import { adminErrorMessage, adminRequest } from "@/lib/admin/admin-request";
import { useAdminSession } from "@/lib/admin/use-admin-session";

export function AdminDashboard() {
  const { user, status, error, login, logout } = useAdminSession();
  const [pendingCount, setPendingCount] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (status !== "admin" || !user) return undefined;
    let cancelled = false;

    adminRequest(user, "/api/admin/reservations?status=PENDING&pageSize=1")
      .then((result) => {
        if (!Number.isInteger(result?.counts?.PENDING)) {
          throw new Error("Invalid reservation counts response.");
        }
        if (!cancelled) {
          setPendingCount(result.counts.PENDING);
          setLoadError("");
        }
      })
      .catch((requestError) => {
        if (!cancelled) setLoadError(adminErrorMessage(requestError.message));
      });

    return () => {
      cancelled = true;
    };
  }, [status, user]);

  if (status === "loading") {
    return <p className="text-muted" role="status">Vérification de l’accès administrateur…</p>;
  }

  if (status !== "admin") {
    return (
      <AdminLoginCard
        error={error}
        onLogin={login}
        onLogout={logout}
        signedIn={Boolean(user)}
      />
    );
  }

  return (
    <Link
      className="block rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      href="/admin/reservations"
    >
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarDays aria-hidden="true" size={23} />
      </span>
      <p className="mb-1 mt-0 text-sm font-bold uppercase tracking-wide text-primary">
        Demandes en attente
      </p>
      <p className="mb-2 mt-0 font-display text-4xl font-bold text-foreground" aria-live="polite">
        {loadError ? "—" : pendingCount ?? "…"}
      </p>
      <p className="mb-0 text-sm text-muted">
        {loadError || "Voir les réservations en attente"}
      </p>
    </Link>
  );
}
