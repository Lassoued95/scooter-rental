import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function WhatsAppButton() {
  const t = await getTranslations("layout");

  return (
    <a
      aria-label={t("whatsapp")}
      className="whatsapp-button"
      href="https://wa.me/21628340240"
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" size={23} />
      <span className="sr-only">{t("whatsapp")}</span>
    </a>
  );
}
