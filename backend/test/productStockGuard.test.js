const assert = require("node:assert/strict");
const test = require("node:test");
const { formatIsoDate, getTodayInTunisia } = require("../src/utils/dateUtils");

const products = new Map();
const reservations = new Map();
const availability = new Map();

function snapshot(value, id) {
  return {
    id,
    exists: value !== undefined,
    data: () => value,
  };
}

function documentReference(collection, id) {
  return { collection, id };
}

const db = {
  collection(name) {
    return {
      doc(id) {
        return documentReference(name, id);
      },
      where(field, operator, value) {
        return { collection: name, field, operator, value };
      },
    };
  },
  async runTransaction(callback) {
    const transaction = {
      async get(reference) {
        if (reference.operator === "==") {
          const store = reference.collection === "reservations" ? reservations : products;
          return {
            docs: [...store.entries()]
              .filter(([, data]) => data[reference.field] === reference.value)
              .map(([id, data]) => snapshot(data, id)),
          };
        }

        const store =
          reference.collection === "products"
            ? products
            : reference.collection === "availability"
              ? availability
              : reservations;
        return snapshot(store.get(reference.id), reference.id);
      },
      set(reference, data) {
        const store = reference.collection === "products" ? products : availability;
        store.set(reference.id, data);
      },
    };

    return callback(transaction);
  },
};

const configPath = require.resolve("../src/config/firebase");
require.cache[configPath] = {
  id: configPath,
  filename: configPath,
  loaded: true,
  exports: {
    db,
    admin: {
      firestore: {
        FieldValue: { serverTimestamp: () => "test-timestamp" },
      },
    },
  },
};

const { updateProduct } = require("../src/services/productService");

function clearFixtures() {
  products.clear();
  reservations.clear();
  availability.clear();
}

function futureDate(offsetDays) {
  const date = new Date(`${getTodayInTunisia()}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return formatIsoDate(date);
}

function vehicle(stock) {
  return {
    id: "scooter-125",
    type: "vehicle",
    stock,
    name: "Scooter",
  };
}

test("rejects a stock reduction below upcoming bookings", async () => {
  clearFixtures();
  products.set("scooter-125", vehicle(6));
  const tomorrow = futureDate(1);
  const nextDay = futureDate(2);
  reservations.set("reservation-1", {
    productId: "scooter-125",
    status: "PENDING",
    startDate: tomorrow,
    endDate: nextDay,
  });
  availability.set(`scooter-125_${tomorrow}`, { booked: 5 });
  availability.set(`scooter-125_${nextDay}`, { booked: 3 });

  await assert.rejects(
    updateProduct("scooter-125", vehicle(3)),
    (error) => error.code === "STOCK_TOO_LOW" && error.message === "Stock too low: 5",
  );
  assert.equal(products.get("scooter-125").stock, 6);
});

test("allows stock at or above peak upcoming bookings", async () => {
  clearFixtures();
  products.set("scooter-125", vehicle(6));
  const tomorrow = futureDate(1);
  const nextDay = futureDate(2);
  reservations.set("reservation-1", {
    productId: "scooter-125",
    status: "CONFIRMED",
    startDate: tomorrow,
    endDate: nextDay,
  });
  reservations.set("reservation-2", {
    productId: "scooter-125",
    status: "COMPLETED",
    startDate: tomorrow,
    endDate: tomorrow,
  });
  availability.set(`scooter-125_${tomorrow}`, { booked: 4 });
  availability.set(`scooter-125_${nextDay}`, { booked: 3 });

  await updateProduct("scooter-125", vehicle(4));

  assert.equal(products.get("scooter-125").stock, 4);
});
