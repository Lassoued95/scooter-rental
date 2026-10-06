const admin = require("firebase-admin");
const path = require("path");

function loadServiceAccount() {
  // Production : JSON encodé en base64 dans une variable d'environnement
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8"),
    );
  }
  // Développement local : fichier (jamais commité)
  return require(path.join(__dirname, "../../firebase-service-account.json"));
}

// évite la double initialisation quand la fonction serverless est réutilisée
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(loadServiceAccount()) });
}

const db = admin.firestore();

module.exports = { admin, db };