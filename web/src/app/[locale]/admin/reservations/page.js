import { setRequestLocale } from "next-intl/server";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { AdminReservationsManager } from "@/components/admin/admin-reservations-manager";

export const metadata = {
  title: "Réservations",
  robots: { index: false, follow: false },
};

export default async function AdminReservationsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <AdminNavigation />
      <AdminReservationsManager />
    </section>
  );
}