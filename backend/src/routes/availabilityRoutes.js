const express = require("express");
const rateLimit = require("express-rate-limit");
const { getAvailabilityHandler } = require("../controllers/reservationController");

const router = express.Router();

router.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

router.get("/:id/availability", getAvailabilityHandler);

module.exports = router;
