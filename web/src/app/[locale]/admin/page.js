import { setRequestLocale } from "next-intl/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export default async function AdminPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
        Espace administrateur
      </p>
      <h1 className="mb-8 mt-0 font-display text-4xl font-bold">
        Tableau de bord
      </h1>
      <AdminNavigation />
      <AdminDashboard />
    </section>
  );
}
