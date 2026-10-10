const { ReservationError } = require("../services/reservationService");
const service = require("../services/adminReservationService");

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
const ID_PATTERN = /^[A-Za-z0-9]{10,40}$/;

function handleError(res, error, label) {
  if (error instanceof ReservationError) {
    const messages = {
      400: "Invalid reservation request.",
      404: "Reservation not found.",
      409: "Cannot change the status for this reservation.",
      429: "Reservation request limit reached. Please try again later.",
    };
    return res
      .status(error.status)
      .json({ success: false, message: messages[error.status] ?? "Request failed." });
  }
  console.error(label, error);
  return res.status(500).json({ success: false, message: "Server error." });
}

async function listReservationsHandler(req, res) {
  try {
    const status = String(req.query.status ?? "").toUpperCase();
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const result = await service.listReservations({
      status: status || undefined,
      q: String(req.query.q ?? "").slice(0, 100),
      page: Math.max(1, parseInt(req.query.page, 10) || 1),
      pageSize: Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 20)),
    });

    res.set("Cache-Control", "no-store");
    return res.json({ success: true, ...result });
  } catch (error) {
    return handleError(res, error, "List reservations error:");
  }
}

async function getReservationHandler(req, res) {
  try {
    if (!ID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ success: false, message: "Reservation not found." });
    }
    const reservation = await service.getReservation(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found." });
    }
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, reservation });
  } catch (error) {
    return handleError(res, error, "Get reservation error:");
  }
}

async function updateReservationStatusHandler(req, res) {
  try {
    if (!ID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ success: false, message: "Reservation not found." });
    }
    const status = String(req.body?.status ?? "").toUpperCase();
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const { reservation, emailSent } = await service.updateReservationStatus(
      req.params.id,
      status,
      req.admin,
    );
    return res.json({ success: true, reservation, emailSent });
  } catch (error) {
    return handleError(res, error, "Update reservation status error:");
  }
}

module.exports = {
  listReservationsHandler,
  getReservationHandler,
  updateReservationStatusHandler,
};