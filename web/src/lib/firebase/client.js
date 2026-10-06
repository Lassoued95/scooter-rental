import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Next.js ne remplace les variables NEXT_PUBLIC_* que si elles sont écrites ainsi, une par une
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// évite la double initialisation en développement (rechargement à chaud)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// on n'exporte QUE l'authentification : jamais Firestore dans le navigateur
export const auth = getAuth(app);