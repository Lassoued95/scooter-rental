const assert = require("node:assert/strict");
const test = require("node:test");

const rateLimits = new Map();

function ref(id) {
  const key = `reservation_contact_limits/${id}`;
  return { key, id };
}

const db = {
  collection: () => ({ doc: ref }),
  async runTransaction(callback) {
    const transaction = {
      async get(document) {
        const value = rateLimits.get(document.key);
        return { data: () => value && structuredClone(value) };
      },
      set(document, value) {
        rateLimits.set(document.key, structuredClone(value));
      },
    };
    return callback(transaction);
  },
};

const firebasePath = require.resolve("../src/config/firebase");
require.cache[firebasePath] = {
  id: firebasePath,
  filename: firebasePath,
  loaded: true,
  exports: { admin: {}, db },
};

const { recordContactRequest, ReservationError } = require("../src/services/reservationService");

test("allows three requests per email and phone within 24 hours, then returns 429", async () => {
  rateLimits.clear();
  const customer = { email: "customer@example.test", phone: "+216 12-34-5678" };

  await recordContactRequest(customer);
  await recordContactRequest(customer);
  await recordContactRequest(customer);
  await assert.rejects(
    recordContactRequest(customer),
    (error) => error instanceof ReservationError && error.status === 429,
  );
  assert.ok([...rateLimits.keys()].every((key) => !key.includes("@") && !key.includes("+")));
});
