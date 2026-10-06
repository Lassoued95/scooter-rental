import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiProducts } from "@/lib/api/products";

export const dynamic = "force-dynamic";

export default async function ApiCheckPage({ params }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, products] = await Promise.all([
    getTranslations("apiCheck"),
    getApiProducts(locale),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-text">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("count", { count: products.length })}</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead className="bg-surface-elevated text-muted">
            <tr>
              {[t("name"), t("category"), t("type"), t("stock"), t("image")].map(
                (heading) => (
                  <th className="px-5 py-4 font-semibold" key={heading} scope="col">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="border-t border-border" key={product.id}>
                <td className="px-5 py-4 font-medium text-text">{product.name}</td>
                <td className="px-5 py-4 text-muted">{product.category}</td>
                <td className="px-5 py-4 text-muted">{product.type}</td>
                <td className="px-5 py-4 text-muted">{product.stock ?? t("notApplicable")}</td>
                <td className="px-5 py-4 text-muted">
                  {product.placeholderImage ? t("placeholder") : t("available")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
