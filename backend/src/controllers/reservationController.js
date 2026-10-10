const { reservationSchema } = require("../schemas/reservation");
const { createVehicleReservation, ReservationError } = require("../services/reservationService");
const productService = require("../services/productService");
const availabilityService = require("../services/availabilityService");
const { validateAvailabilityQuery } = require("../utils/availabilityQuery");

async function createReservationHandler(req, res) {
  if (typeof req.body?.website === "string" && req.body.website.trim()) {
    return res.status(201).json({
      success: true,
      reservation: {
        id: "",
        reference: "LS-000000",
        status: "PENDING",
      },
    });
  }

  const result = reservationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Please check the reservation details and try again.",
    });
  }

  if (result.data.items.length !== 1 || result.data.items[0].date) {
    return res.status(400).json({
      success: false,
      message: "Only single-vehicle reservations are supported.",
    });
  }

  try {
    const reservation = await createVehicleReservation(result.data);
    return res.status(201).json({ success: true, reservation });
  } catch (error) {
    if (error instanceof ReservationError) {
      const messages = {
        400: "Please check the reservation details and try again.",
        404: "This vehicle is no longer available.",
        409: "The requested dates or quantity are not available.",
        429: "The reservation limit for this email address or phone number is 3 requests per 24 hours.",
      };
      return res.status(error.status).json({
        success: false,
        message: messages[error.status] ?? "Unable to create the reservation.",
      });
    }

    console.error("Create reservation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create the reservation. Please try again.",
    });
  }
}

async function getAvailabilityHandler(req, res) {
  const parsed = validateAvailabilityQuery({
    id: req.params.id,
    start: req.query.start,
    end: req.query.end,
  });
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.message });
  }

  try {
    const product = await productService.getProductById(parsed.productId);
    if (!product || product.active !== true || product.type !== "vehicle") {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const snapshot = await availabilityService.getAvailabilitySnapshot(product, {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    });
    const stock = Math.max(0, Number(product.stock) || 0);

    res.set("Cache-Control", "public, max-age=10, s-maxage=15, stale-while-revalidate=15");
    return res.json({
      success: true,
      available: Math.max(0, Math.min(stock, Number(snapshot.available) || 0)),
      stock,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    return res.status(500).json({ success: false, message: "Unable to check availability." });
  }
}

module.exports = { createReservationHandler, getAvailabilityHandler };