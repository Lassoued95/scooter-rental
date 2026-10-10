import { Link } from "@/i18n/navigation";

const linkClass =
  "inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-surface-elevated";

export function AdminNavigation() {
  return (
    <nav aria-label="Navigation administrateur" className="mb-8 flex flex-wrap gap-2">
      <Link className={linkClass} href="/admin/products">
        Produits
      </Link>
      <Link className={linkClass} href="/admin/reservations">
        Réservations
      </Link>
    </nav>
  );
}
