const assert = require("node:assert/strict");
const test = require("node:test");

class MockReservationError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let createCalls = 0;
const reservationServicePath = require.resolve("../src/services/reservationService");
const productServicePath = require.resolve("../src/services/productService");
const availabilityServicePath = require.resolve("../src/services/availabilityService");

require.cache[reservationServicePath] = {
  id: reservationServicePath,
  filename: reservationServicePath,
  loaded: true,
  exports: {
    ReservationError: MockReservationError,
    createVehicleReservation: async () => {
      createCalls += 1;
      throw new MockReservationError("Internal details must not be returned.", 409);
    },
  },
};
require.cache[productServicePath] = {
  id: productServicePath,
  filename: productServicePath,
  loaded: true,
  exports: {},
};
require.cache[availabilityServicePath] = {
  id: availabilityServicePath,
  filename: availabilityServicePath,
  loaded: true,
  exports: {},
};

const { createReservationHandler } = require("../src/controllers/reservationController");

function responseCapture() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("filled honeypot returns fake success without creating a reservation", async () => {
  createCalls = 0;
  const response = responseCapture();

  await createReservationHandler(
    { body: { website: "bot-filled" } },
    response,
  );

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.reservation.reference, "LS-000000");
  assert.equal(createCalls, 0);
});

test("reservation errors return a safe message, not the internal error.message", async () => {
  const response = responseCapture();

  await createReservationHandler(
    {
      body: {
        items: [{ productId: "scooter-125", quantity: 1, startDate: "2026-10-12", endDate: "2026-10-12" }],
        customer: { fullName: "Test Customer", phone: "+21612345678", email: "customer@example.test" },
        locale: "fr",
        termsAccepted: true,
      },
    },
    response,
  );

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.message, "The requested dates or quantity are not available.");
  assert.ok(!response.body.message.includes("Internal details"));
});
