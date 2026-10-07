const { reservationSchema } = require("../schemas/reservation");
const { createVehicleReservation, ReservationError } = require("../services/reservationService");

async function createReservationHandler(req, res) {
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
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create reservation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create the reservation. Please try again.",
    });
  }
}

module.exports = { createReservationHandler };