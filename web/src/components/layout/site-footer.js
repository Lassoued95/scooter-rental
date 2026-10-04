import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("layout");

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand" href="/">
          <Image
            alt=""
            className="brand-logo brand-logo-footer"
            height={64}
            src="/logos/location-scooter-djerba-logo.png"
            width={64}
          />
          <span>{t("brand")}</span>
        </Link>
        <div className="footer-contact">
          <span>{t("footer")}</span>
          <a href="tel:+21628340240">{t("call")}: +216 28 340 240</a>
        </div>
      </div>
    </footer>
  );
}
