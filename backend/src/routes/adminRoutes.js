const express = require("express");
const rateLimit = require("express-rate-limit");
const requireAdmin = require("../middleware/requireAdmin");
const { getUploadSignature } = require("../controllers/cloudinaryController");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminProductController");


const {
  listReservationsHandler,
  getReservationHandler,
  updateReservationStatusHandler,
} = require("../controllers/adminReservationController");

const router = express.Router();

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Tout ce qui suit exige un administrateur connecté
router.use(requireAdmin);

router.get("/reservations", listReservationsHandler);
router.get("/reservations/:id", getReservationHandler);
router.patch("/reservations/:id/status", updateReservationStatusHandler);

router.get("/me", (req, res) => {
  res.json({ success: true, admin: req.admin });
});

router.post("/cloudinary-signature", getUploadSignature);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;