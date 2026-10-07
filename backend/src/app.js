require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

// API publique lisible depuis un autre domaine (le site) : on autorise la lecture cross-origin
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin(origin, callback) {
      // pas d'origine = appels serveur à serveur (Next.js, curl)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Location Scooter Djerba API is running" });
});

// route de test Firebase : développement seulement
if (process.env.NODE_ENV !== "production") {
  const { db } = require("./config/firebase");

  app.get("/test/firebase", async (req, res) => {
    try {
      const snapshot = await db.collection("products").limit(1).get();
      res.json({ success: true, firebase: "connected", documentsFound: snapshot.size });
    } catch (error) {
      console.error("Firebase error:", error);
      res.status(500).json({ success: false, firebase: "connection failed" });
    }
  });
}

app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;