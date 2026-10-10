"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const inputClass =
  "min-h-12 rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AdminLoginCard({ error, onLogin, onLogout, signedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    const ok = await onLogin(email, password);
    setBusy(false);
    if (ok) setPassword("");
  }

  return (
    <section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
      <div className="bg-brand-section px-6 py-7 text-section-text sm:px-8">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck aria-hidden="true" size={25} />
        </span>
        <h2 className="m-0 font-display text-2xl font-bold">
          Connexion administrateur
        </h2>
        <p className="mb-0 mt-2 text-sm leading-6 opacity-80">
          Connectez-vous avec le compte autorisé.
        </p>
      </div>
      <div className="p-6 sm:p-8">
        {error && (
          <p
            className="mb-5 rounded-xl bg-error-background p-4 text-sm leading-6 text-error"
            role="alert"
          >
            {error}
          </p>
        )}
        {signedIn && (
          <button
            className="mb-5 min-h-10 rounded-full border border-border px-4 text-sm font-semibold"
            onClick={onLogout}
            type="button"
          >
            Se déconnecter
          </button>
        )}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold" htmlFor="login-email">
            Adresse e-mail
            <input
              autoComplete="username"
              className={inputClass}
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold" htmlFor="login-password">
            Mot de passe
            <input
              autoComplete="current-password"
              className={inputClass}
              id="login-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button
            className="mt-2 min-h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </section>
  );
}