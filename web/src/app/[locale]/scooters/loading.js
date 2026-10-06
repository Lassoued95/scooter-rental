import { getTranslations } from "next-intl/server";

export default async function ScootersLoading() {
  const t = await getTranslations("products");

  return (
    <section
      aria-busy="true"
      aria-label={t("loading")}
      className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="h-4 w-36 animate-pulse rounded bg-surface-elevated" />
      <div className="mt-4 h-12 max-w-lg animate-pulse rounded-xl bg-surface-elevated" />
      <div className="mt-4 h-6 max-w-2xl animate-pulse rounded-lg bg-surface-elevated" />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="overflow-hidden rounded-3xl border border-border bg-surface"
            key={index}
          >
            <div className="aspect-[4/3] animate-pulse bg-surface-elevated" />
            <div className="space-y-4 p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-surface-elevated" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-elevated" />
              <div className="h-11 w-full animate-pulse rounded-full bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
