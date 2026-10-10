const assert = require("node:assert/strict");
const test = require("node:test");

const reservations = new Map();
const availability = new Map();
let availabilityWrites = 0;
let transactionReadAfterWrite = false;
let failEmail = false;

function makeSnapshot(value, id) {
  return {
    id,
    exists: value !== undefined,
    data: () => (value === undefined ? undefined : structuredClone(value)),
  };
}

function applyUpdate(target, values) {
  for (const [key, value] of Object.entries(values)) {
    if (key === "history" && value?.arrayUnion) {
      target.history = [...(target.history ?? []), value.arrayUnion];
    } else if (key.includes(".")) {
      const [parent, child] = key.split(".");
      target[parent] = { ...(target[parent] ?? {}), [child]: value };
    } else {
      target[key] = value;
    }
  }
}

function reference(collectionName, id) {
  const key = `${collectionName}/${id}`;
  const store = collectionName === "reservations" ? reservations : availability;
  return {
    id,
    key,
    get: async () => makeSnapshot(store.get(key), id),
    update: async (values) => {
      const current = store.get(key);
      if (!current) throw new Error("Missing reference in test fixture.");
      applyUpdate(current, values);
    },
  };
}

const db = {
  collection(name) {
    return {
      doc(id) {
        return reference(name, id);
      },
      orderBy() {
        return this;
      },
      limit() {
        return this;
      },
      get: async () => ({
        docs: [...reservations.entries()]
          .map(([key, data]) => makeSnapshot(data, key.slice("reservations/".length)))
          .sort((left, right) => String(right.data().createdAt).localeCompare(String(left.data().createdAt))),
      }),
    };
  },
  async runTransaction(callback) {
    let wrote = false;
    const transaction = {
      async get(ref) {
        if (wrote) transactionReadAfterWrite = true;
        const store = ref.key.startsWith("reservations/") ? reservations : availability;
        return makeSnapshot(store.get(ref.key), ref.id);
      },
      update(ref, values) {
        wrote = true;
        applyUpdate(reservations.get(ref.key), values);
      },
      set(ref, values) {
        wrote = true;
        availabilityWrites += ref.key.startsWith("availability/") ? 1 : 0;
        const store = ref.key.startsWith("reservations/") ? reservations : availability;
        store.set(ref.key, { ...(store.get(ref.key) ?? {}), ...values });
      },
    };
    return callback(transaction);
  },
};

const mockFirebase = {
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => "test-timestamp",
        arrayUnion: (entry) => ({ arrayUnion: entry }),
      },
    },
  },
  db,
};

const firebasePath = require.resolve("../src/config/firebase");
const mailPath = require.resolve("../src/services/mailService");
require.cache[firebasePath] = { id: firebasePath, filename: firebasePath, loaded: true, exports: mockFirebase };
async function mockedSendMail() {
  if (failEmail) throw Object.assign(new Error("Private mail details"), { code: "MAIL_DOWN" });
  return { ok: true };
}
require.cache[mailPath] = {
  id: mailPath,
  filename: mailPath,
  loaded: true,
  exports: { sendMail: mockedSendMail },
};

const {
  listReservations,
  updateReservationStatus,
} = require("../src/services/adminReservationService");

const id = "AbCdEf0123456789";

function clearFixtures() {
  reservations.clear();
  availability.clear();
  availabilityWrites = 0;
  transactionReadAfterWrite = false;
  failEmail = false;
}

test("cancellation reads before writes and releases stock only once", async () => {
  clearFixtures();
  reservations.set(`reservations/${id}`, {
    status: "CONFIRMED",
    productId: "scooter-125",
    productName: "Scooter",
    startDate: "2026-10-12",
    endDate: "2026-10-13",
    quantity: 2,
    totalPrice: 100,
    customer: { name: "Test", email: "customer@example.test", phone: "21612345678" },
    locale: "fr",
    history: [],
  });
  availability.set("availability/scooter-125_2026-10-12", { booked: 3 });
  availability.set("availability/scooter-125_2026-10-13", { booked: 2 });

  await updateReservationStatus(id, "CANCELLED", { uid: "admin-1" });
  const writesAfterCancellation = availabilityWrites;
  await updateReservationStatus(id, "CANCELLED", { uid: "admin-1" });

  assert.equal(availability.get("availability/scooter-125_2026-10-12").booked, 1);
  assert.equal(availability.get("availability/scooter-125_2026-10-13").booked, 0);
  assert.equal(availabilityWrites, writesAfterCancellation);
  assert.equal(transactionReadAfterWrite, false);
});

test("rejects invalid status transitions with conflict status 409", async () => {
  clearFixtures();
  reservations.set(`reservations/${id}`, { status: "PENDING", history: [] });

  await assert.rejects(
    updateReservationStatus(id, "COMPLETED", { uid: "admin-1" }),
    (error) => error.status === 409,
  );
  assert.equal(reservations.get(`reservations/${id}`).status, "PENDING");
});

test("mail delivery failure does not fail a completed status transition", async () => {
  clearFixtures();
  failEmail = true;
  reservations.set(`reservations/${id}`, {
    status: "PENDING",
    productId: "scooter-125",
    productName: "Scooter",
    startDate: "2026-10-12",
    endDate: "2026-10-12",
    quantity: 1,
    totalPrice: 50,
    currency: "EUR",
    customer: { name: "Test", email: "customer@example.test", phone: "21612345678" },
    locale: "en",
    history: [],
  });

  const originalError = console.error;
  console.error = () => {};
  try {
    const result = await updateReservationStatus(id, "CONFIRMED", { uid: "admin-1" });
    assert.equal(result.reservation.status, "CONFIRMED");
    assert.equal(result.emailSent, false);
  } finally {
    console.error = originalError;
  }
});

test("searches names and phone digits and serializes stored references", async () => {
  clearFixtures();
  reservations.set(`reservations/${id}`, {
    reference: "HUMAN123",
    status: "PENDING",
    productId: "scooter-125",
    productName: "Scooter",
    customer: { name: "Zoë Rider", email: "customer@example.test", phone: "+216 12-34-5678" },
    createdAt: "2026-10-08T10:00:00.000Z",
  });

  const byName = await listReservations({ q: "Zoe", pageSize: 20 });
  const byPhone = await listReservations({ q: "2161234", pageSize: 20 });
  assert.equal(byName.reservations[0].reference, "HUMAN123");
  assert.equal(byPhone.reservations[0].customer.name, "Zoë Rider");

  reservations.set("reservations/xyz98765aa", {
    status: "PENDING",
    customer: { name: "Another customer", phone: "12345678" },
  });
  const withFallback = await listReservations({ q: "Another", pageSize: 20 });
  assert.equal(withFallback.reservations[0].reference, "XYZ98765");
});
