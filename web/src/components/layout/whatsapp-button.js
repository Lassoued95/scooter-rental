import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function WhatsAppButton() {
  const t = await getTranslations("layout");

  return (
    <a
      aria-label={t("whatsapp")}
      className="fixed bottom-5 right-5 z-20 inline-flex size-14 items-center justify-center rounded-full border-2 border-whatsapp bg-whatsapp text-primary-foreground shadow-lg shadow-brand-section/30 transition-transform duration-150 hover:-translate-y-0.5"
      href="https://wa.me/21628340240"
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" size={23} />
      <span className="sr-only">{t("whatsapp")}</span>
    </a>
  );
}
