const WHATSAPP_URL = "https://wa.me/21628340240";

const TEXTS = {
  fr: {
    hello: "Bonjour",
    labels: { reference: "Référence", vehicle: "Véhicule", dates: "Dates", quantity: "Quantité", total: "Total" },
    pay: "Paiement sur place, sans caution.",
    contact: "Une question ? Écrivez-nous sur WhatsApp :",
    RECEIVED: { subject: "Nous avons reçu votre demande de réservation", intro: "Nous avons bien reçu votre demande. Elle est en attente de confirmation." },
    CONFIRMED: { subject: "Votre réservation est confirmée", intro: "Bonne nouvelle : votre réservation est confirmée." },
    CANCELLED: { subject: "Votre réservation est annulée", intro: "Votre réservation a été annulée. Contactez-nous si vous souhaitez réserver à d'autres dates." },
  },
  en: {
    hello: "Hello",
    labels: { reference: "Reference", vehicle: "Vehicle", dates: "Dates", quantity: "Quantity", total: "Total" },
    pay: "Payment on site, no deposit.",
    contact: "Questions? Message us on WhatsApp:",
    RECEIVED: { subject: "We received your reservation request", intro: "We received your request. It is pending confirmation." },
    CONFIRMED: { subject: "Your reservation is confirmed", intro: "Good news: your reservation is confirmed." },
    CANCELLED: { subject: "Your reservation has been cancelled", intro: "Your reservation has been cancelled. Contact us if you would like to book other dates." },
  },
  de: {
    hello: "Hallo",
    labels: { reference: "Referenz", vehicle: "Fahrzeug", dates: "Datum", quantity: "Anzahl", total: "Gesamt" },
    pay: "Zahlung vor Ort, ohne Kaution.",
    contact: "Fragen? Schreiben Sie uns auf WhatsApp:",
    RECEIVED: { subject: "Wir haben Ihre Reservierungsanfrage erhalten", intro: "Wir haben Ihre Anfrage erhalten. Sie wartet auf Bestätigung." },
    CONFIRMED: { subject: "Ihre Reservierung ist bestätigt", intro: "Gute Nachrichten: Ihre Reservierung ist bestätigt." },
    CANCELLED: { subject: "Ihre Reservierung wurde storniert", intro: "Ihre Reservierung wurde storniert. Kontaktieren Sie uns gern für andere Termine." },
  },
  it: {
    hello: "Buongiorno",
    labels: { reference: "Riferimento", vehicle: "Veicolo", dates: "Date", quantity: "Quantità", total: "Totale" },
    pay: "Pagamento in loco, senza cauzione.",
    contact: "Domande? Scrivici su WhatsApp:",
    RECEIVED: { subject: "Abbiamo ricevuto la tua richiesta di prenotazione", intro: "Abbiamo ricevuto la tua richiesta. È in attesa di conferma." },
    CONFIRMED: { subject: "La tua prenotazione è confermata", intro: "Buone notizie: la tua prenotazione è confermata." },
    CANCELLED: { subject: "La tua prenotazione è stata annullata", intro: "La tua prenotazione è stata annullata. Contattaci se vuoi prenotare per altre date." },
  },
  pl: {
    hello: "Dzień dobry",
    labels: { reference: "Numer", vehicle: "Pojazd", dates: "Daty", quantity: "Liczba", total: "Razem" },
    pay: "Płatność na miejscu, bez kaucji.",
    contact: "Pytania? Napisz do nas na WhatsApp:",
    RECEIVED: { subject: "Otrzymaliśmy prośbę o rezerwację", intro: "Otrzymaliśmy Twoją prośbę. Oczekuje na potwierdzenie." },
    CONFIRMED: { subject: "Twoja rezerwacja została potwierdzona", intro: "Dobra wiadomość: Twoja rezerwacja została potwierdzona." },
    CANCELLED: { subject: "Twoja rezerwacja została anulowana", intro: "Twoja rezerwacja została anulowana. Skontaktuj się z nami, jeśli chcesz zarezerwować inny termin." },
  },
  pt: {
    hello: "Olá",
    labels: { reference: "Referência", vehicle: "Veículo", dates: "Datas", quantity: "Quantidade", total: "Total" },
    pay: "Pagamento no local, sem caução.",
    contact: "Dúvidas? Escreva-nos no WhatsApp:",
    RECEIVED: { subject: "Recebemos o seu pedido de reserva", intro: "Recebemos o seu pedido. Está pendente de confirmação." },
    CONFIRMED: { subject: "A sua reserva está confirmada", intro: "Boas notícias: a sua reserva está confirmada." },
    CANCELLED: { subject: "A sua reserva foi cancelada", intro: "A sua reserva foi cancelada. Contacte-nos se quiser reservar para outras datas." },
  },
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function sanitizeSubject(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ");
}

// status : "CONFIRMED" ou "CANCELLED". Le sujet ne contient aucune donnée du client.
function buildStatusEmail(status, reservation) {
  const t = TEXTS[reservation.locale] ?? TEXTS.en;
  const copy = t[status];
  const showPay = status === "CONFIRMED";

  const rows = [
    [t.labels.reference, reservation.reference],
    [t.labels.vehicle, reservation.productName],
    [t.labels.dates, `${reservation.startDate} - ${reservation.endDate}`],
    [t.labels.quantity, String(reservation.quantity)],
    [t.labels.total, `${Number(reservation.totalPrice).toFixed(2)} ${reservation.currency}`],
  ];

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#16254A">',
    `<h2 style="margin:0 0 12px">${escapeHtml(copy.subject)}</h2>`,
    `<p>${escapeHtml(t.hello)} ${escapeHtml(reservation.customer.name)},</p>`,
    `<p>${escapeHtml(copy.intro)}</p>`,
    '<table style="border-collapse:collapse;width:100%">',
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;color:#58677F">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:bold">${escapeHtml(value)}</td></tr>`,
    ),
    "</table>",
    showPay ? `<p><strong>${escapeHtml(t.pay)}</strong></p>` : "",
    `<p>${escapeHtml(t.contact)} <a href="${WHATSAPP_URL}">+216 28 340 240</a></p>`,
    "</div>",
  ].join("");

  const text = [
    `${t.hello} ${reservation.customer.name},`,
    "",
    copy.intro,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    showPay ? t.pay : "",
    `${t.contact} ${WHATSAPP_URL}`,
  ].join("\n");

  return { subject: sanitizeSubject(copy.subject), html, text };
}

module.exports = { buildStatusEmail, escapeHtml, sanitizeSubject };