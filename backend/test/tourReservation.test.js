const assert = require("node:assert/strict");
const test = require("node:test");

const reads = [];
let createdRecord = null;

const db = {
  collection(name) {
    return {
      doc(id = "new-tour-reservation") {
        return { collection: name, id };
      },
    };
  },
  async runTransaction(callback) {
    const transaction = {
      async get(reference) {
        reads.push(reference.collection);
        if (reference.collection === "reservation_contact_limits") {
          return { data: () => undefined };
        }
        if (reference.collection === "products") {
          return {
            exists: true,
            id: reference.id,
            data: () => ({
              active: true,
              type: "tour",
              name: "Island Tour",
              price: { amount: 50, currency: "EUR" },
            }),
          };
        }
        throw new Error(`Unexpected transaction read: ${reference.collection}`);
      },
      create(_reference, record) {
        createdRecord = record;
      },
      set(reference) {
        if (reference.collection === "availability") {
          throw new Error("Tour reservations must not update availability.");
        }
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
  exports: {
    admin: { firestore: { FieldValue: { serverTimestamp: () => "created-at" } } },
    db,
  },
};

const mailServicePath = require.resolve("../src/services/mailService");
require.cache[mailServicePath] = {
  id: mailServicePath,
  filename: mailServicePath,
  loaded: true,
  exports: { sendMail: async () => ({ ok: true }) },
};

const { createTourReservation } = require("../src/services/reservationService");

test("tour reservation is recorded without reading or writing seat availability", async () => {
  reads.length = 0;
  createdRecord = null;
  const previousNotifyEmail = process.env.AGENCY_NOTIFY_EMAIL;
  process.env.AGENCY_NOTIFY_EMAIL = "agency@example.test";

  try {
    const result = await createTourReservation({
      items: [{
        productId: "island-tour",
        quantity: 25,
        date: "2099-10-20",
        departureTime: "14:00",
      }],
      customer: {
        fullName: "Test Customer",
        email: "customer@example.test",
        phone: "+21612345678",
      },
      locale: "en",
    });

    assert.equal(result.status, "PENDING");
    assert.equal(createdRecord.type, "tour");
    assert.equal(createdRecord.date, "2099-10-20");
    assert.equal(createdRecord.departureTime, "14:00");
    assert.equal(createdRecord.quantity, 25);
    assert.equal(createdRecord.unitPrice, 50);
    assert.equal(createdRecord.totalPrice, 1250);
    assert.deepEqual(reads.sort(), ["products", "reservation_contact_limits", "reservation_contact_limits"].sort());
  } finally {
    if (previousNotifyEmail === undefined) {
      delete process.env.AGENCY_NOTIFY_EMAIL;
    } else {
      process.env.AGENCY_NOTIFY_EMAIL = previousNotifyEmail;
    }
  }
});
