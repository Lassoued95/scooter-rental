const { admin } = require("../config/firebase");

// Vérifie le jeton Firebase ET le droit "admin" sur chaque requête
const requireAdmin = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  try {
    // true = vérifie aussi que le jeton n'a pas été révoqué
    const decoded = await admin.auth().verifyIdToken(token, true);

    if (decoded.admin !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    req.admin = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = requireAdmin;