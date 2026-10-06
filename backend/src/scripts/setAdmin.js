require("dotenv").config();
const { admin } = require("../config/firebase");

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run set-admin -- email@example.com");
    process.exit(1);
  }

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });

  console.log(`✅ ${email} est maintenant administrateur (uid: ${user.uid}).`);
  console.log("Déconnecte-toi puis reconnecte-toi pour rafraîchir le jeton.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Erreur :", error.message);
  process.exit(1);
});