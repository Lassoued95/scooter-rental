import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

export default withNextIntl({
  allowedDevOrigins: ["172.18.176.1"],
});