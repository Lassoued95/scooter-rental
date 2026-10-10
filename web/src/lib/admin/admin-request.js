const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(
  /\/$/,
  "",
);

export async function adminRequest(user, path, options = {}) {
  const token = await user.getIdToken();
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the API. Check that the backend is running.");
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? response.statusText);
  return data;
}

export function adminErrorMessage(message = "") {
  if (
    message.includes("auth/invalid-credential") ||
    message.includes("auth/wrong-password") ||
    message.includes("auth/user-not-found")
  ) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  if (message.includes("Could not reach the API")) {
    return "Impossible de joindre l’API. Vérifiez que le serveur est démarré.";
  }
  if (message.includes("Admin access required")) {
    return "Ce compte n’a pas les droits administrateur.";
  }
  if (
    message.includes("Authentication required") ||
    message.includes("Invalid or expired token")
  ) {
    return "Votre session a expiré. Déconnectez-vous puis reconnectez-vous.";
  }
  if (message.includes("Reservation not found")) {
    return "Cette réservation n’existe plus. Actualisez la liste.";
  }
  if (message.includes("Cannot change the status")) {
    return "Ce changement de statut n’est pas possible pour cette réservation.";
  }
  return "Une erreur est survenue. Réessayez.";
}