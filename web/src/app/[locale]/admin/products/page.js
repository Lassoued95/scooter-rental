import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
        Espace administrateur
      </p>
      <h1 className="mb-8 mt-0 font-display text-4xl font-bold">
        Gestion des produits
      </h1>
      <AdminNavigation />
      <AdminProductsManager />
    </section>
  );
}
