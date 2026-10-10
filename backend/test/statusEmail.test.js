const assert = require("node:assert/strict");
const test = require("node:test");

const { buildStatusEmail, escapeHtml, sanitizeSubject } = require("../src/emails/statusEmail");

const locales = ["fr", "en", "de", "it", "pl", "pt"];

function reservation(locale, overrides = {}) {
  return {
    locale,
    reference: "ABC12345",
    productName: "Scooter <125>",
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    quantity: 2,
    totalPrice: 100,
    currency: "EUR",
    customer: { name: 'Zoë "Rider"', email: "customer@example.test" },
    ...overrides,
  };
}

test("escapes HTML and removes CR/LF from mail subjects", () => {
  assert.equal(escapeHtml(`<a title="x">&'`), "&lt;a title=&quot;x&quot;&gt;&amp;&#39;");
  assert.equal(sanitizeSubject("Request\r\nInjected"), "Request Injected");
});

test("builds complete localized reservation emails for all six locales", () => {
  for (const locale of locales) {
    for (const status of ["RECEIVED", "CONFIRMED", "CANCELLED"]) {
      const email = buildStatusEmail(status, reservation(locale));
      assert.ok(email.subject.length > 0, `${locale} ${status} subject`);
      assert.ok(email.html.includes("ABC12345"), `${locale} ${status} reference`);
      assert.ok(!/\b(?:undefined|null)\b/.test(`${email.subject}${email.html}${email.text}`));
      assert.ok(!/[\r\n]/.test(email.subject));
    }
  }
});

test("escapes customer and product values in the HTML body", () => {
  const email = buildStatusEmail("RECEIVED", reservation("en"));
  assert.ok(email.html.includes("Zoë &quot;Rider&quot;"));
  assert.ok(email.html.includes("Scooter &lt;125&gt;"));
});
