const nodemailer = require("nodemailer");

let transporter;

function isConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM,
  );
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE ?? "true") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

// Ne lève JAMAIS d'erreur : une panne d'e-mail ne doit pas annuler une réservation.
async function sendMail({ to, subject, html, text, replyTo }) {
  if (process.env.MAIL_DRY_RUN === "true" || !isConfigured()) {
    // on ne journalise pas le destinataire (donnée personnelle)
    console.log(`[mail:dry-run] subject="${subject}"`);
    return { ok: false, skipped: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("Mail error:", error.code || "MAIL_FAILED");
    return { ok: false, error: error.code || "MAIL_FAILED" };
  }
}

module.exports = { sendMail, isConfigured };