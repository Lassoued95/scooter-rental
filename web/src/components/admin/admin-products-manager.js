"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { auth } from "@/lib/firebase/client";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(
  /\/$/,
  "",
);

// NOUVEAU : valeur par défaut pour ne jamais planter si l'erreur n'a pas de message
function frenchAdminError(message = "") {
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

  // NOUVEAU : baisse de stock refusée (des réservations à venir l'utilisent encore)
  const stockMatch = message.match(/Stock too low: (\d+)/);
  if (stockMatch) {
    const count = stockMatch[1];
    return `Le stock ne peut pas être inférieur à ${count} : ${count} véhicule(s) sont déjà réservés pour une date à venir. Annulez ou terminez d’abord ces réservations.`;
  }

  if (message.includes("already exists")) {
    return "Cet identifiant est déjà utilisé par un autre produit.";
  }
  if (message.includes("Invalid product")) {
    return "Vérifiez les champs obligatoires et les traductions du produit.";
  }
  if (message.includes("Product not found")) {
    return "Ce produit n’existe plus. Actualisez la liste.";
  }
  if (message.includes("Failed to fetch products")) {
    return "Impossible de charger les produits. Réessayez.";
  }
  if (message.includes("Failed to create product")) {
    return "La création du produit a échoué. Vérifiez les informations.";
  }
  if (message.includes("Failed to update product")) {
    return "La modification du produit a échoué. Vérifiez les informations.";
  }
  if (message.includes("Failed to delete product")) {
    return "La suppression du produit a échoué. Réessayez.";
  }
  if (message.includes("Cloudinary upload is not configured")) {
    return "L’envoi d’images n’est pas configuré sur le serveur. Vérifiez les paramètres Cloudinary.";
  }
  if (message.includes("Failed to upload image")) {
    return "L’envoi de l’image a échoué. Vérifiez votre connexion puis réessayez.";
  }
  return "Une erreur est survenue. Vérifiez les informations et réessayez.";
}

async function adminRequest(user, path, options = {}) {
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
  if (!response.ok) {
    throw new Error(data?.message ?? response.statusText);
  }
  return data;
}

async function uploadProductImage(user, file) {
  const { upload } = await adminRequest(
    user,
    "/api/admin/cloudinary-signature",
    { method: "POST" },
  );
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", upload.apiKey);
  formData.append("folder", upload.folder);
  formData.append("timestamp", String(upload.timestamp));
  formData.append("signature", upload.signature);

  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/image/upload`,
      { method: "POST", body: formData },
    );
  } catch {
    throw new Error("Failed to upload image");
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.secure_url || !result?.public_id) {
    throw new Error(result?.error?.message ?? "Failed to upload image");
  }

  return { url: result.secure_url, publicId: result.public_id };
}

function getProductImageUrl(product) {
  const image = product.images?.[0] ?? product.image ?? product.imageUrl;
  if (typeof image === "string") {
    if (image.startsWith("http") || image.startsWith("/")) return image;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/${image}`
      : null;
  }
  if (image?.url) return image.url;
  if (image?.publicId) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`
      : null;
  }
  return null;
}

// NOUVEAU : ligne de stock affichée sous le nom du produit
function StockLine({ product }) {
  if (product.type === "vehicle") {
    const stock = Number(product.stock);
    const valid = Number.isFinite(stock);

    if (!valid || stock <= 0) {
      return (
        <p className="mb-0 mt-1 text-xs font-semibold text-error">
          Aucun véhicule en stock : non réservable
        </p>
      );
    }
    return (
      <p className="mb-0 mt-1 text-xs text-muted">
        {stock} véhicule{stock > 1 ? "s" : ""} en stock
      </p>
    );
  }

  if (product.type === "tour" && Number.isFinite(Number(product.capacityPerSlot))) {
    const places = Number(product.capacityPerSlot);
    return (
      <p className="mb-0 mt-1 text-xs text-muted">
        {places} place{places > 1 ? "s" : ""} par départ
      </p>
    );
  }

  return null;
}

export function AdminProductsManager() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async (currentUser) => {
    setBusy(true);
    setError("");
    try {
      await currentUser.getIdToken(true);
      await adminRequest(currentUser, "/api/admin/me");
      setIsAdmin(true);
      const result = await adminRequest(currentUser, "/api/admin/products");
      setProducts(result.products);
    } catch (requestError) {
      setIsAdmin(false);
      setProducts([]);
      setError(frenchAdminError(requestError.message));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      setIsAdmin(false);
      setProducts([]);
      setError("");
      setEditor(null);
      setSelectedId(null);
      setIsCreating(false);
      if (currentUser) void loadProducts(currentUser);
    });
    return unsubscribe;
  }, [loadProducts]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (loginError) {
      setError(frenchAdminError(loginError.message));
      setBusy(false);
    }
  }

  function selectProduct(product) {
    setSelectedId(product.id);
    setIsCreating(false);
    setEditor(product);
    setNotice("");
    setError("");
  }

  function startNewProduct() {
    setSelectedId(null);
    setIsCreating(true);
    setEditor(null);
    setNotice("");
    setError("");
  }

  async function saveProduct(product) {
    if (!user) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const path = isCreating
        ? "/api/admin/products"
        : `/api/admin/products/${encodeURIComponent(selectedId)}`;
      await adminRequest(user, path, {
        method: isCreating ? "POST" : "PUT",
        body: JSON.stringify(product),
      });
      setSelectedId(null);
      setIsCreating(false);
      setEditor(null);
      setNotice(
        isCreating
          ? "Le produit a été créé."
          : "Les modifications sont enregistrées.",
      );
      await loadProducts(user);
    } catch (saveError) {
      setError(frenchAdminError(saveError.message));
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(product) {
    if (
      !user ||
      !window.confirm(`Supprimer définitivement « ${product.name} » ?`)
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        user,
        `/api/admin/products/${encodeURIComponent(product.id)}`,
        { method: "DELETE" },
      );
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (selectedId === product.id) {
        setSelectedId(null);
        setEditor(null);
      }
      setNotice("Le produit a été supprimé.");
    } catch (deleteError) {
      setError(frenchAdminError(deleteError.message));
    } finally {
      setBusy(false);
    }
  }

  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.id} ${product.category}`
      .toLocaleLowerCase("fr")
      .includes(search.toLocaleLowerCase("fr")),
  );

  function closeEditor() {
    setIsCreating(false);
    setSelectedId(null);
    setEditor(null);
    setError("");
  }

  if (!authReady || (user && busy && !isAdmin && !error)) {
    return (
      <p className="flex items-center gap-3 text-muted" role="status">
        <span className="size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
        Vérification de l’accès administrateur…
      </p>
    );
  }

  if (!user || (!isAdmin && error)) {
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
            Connectez-vous avec le compte autorisé à gérer les produits.
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
          {user && (
            <button
              className="mb-5 min-h-10 rounded-full border border-border px-4 text-sm font-semibold"
              onClick={() => void signOut(auth)}
              type="button"
            >
              Se déconnecter
            </button>
          )}
          <form className="grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-semibold" htmlFor="admin-email">
              Adresse e-mail
              <input
                autoComplete="username"
                className="min-h-12 rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                id="admin-email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label
              className="grid gap-2 text-sm font-semibold"
              htmlFor="admin-password"
            >
              Mot de passe
              <input
                autoComplete="current-password"
                className="min-h-12 rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                id="admin-password"
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

  if (isCreating || editor) {
    return (
      <div className="grid gap-5">
        {error && (
          <p
            className="m-0 rounded-xl bg-error-background p-4 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}
        <section className="min-w-0 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {isCreating ? "Nouveau produit" : "Modification"}
              </p>
              <h2 className="m-0 font-display text-2xl font-bold sm:text-3xl">
                {isCreating ? "Créer un produit" : "Modifier le produit"}
              </h2>
              <p className="mb-0 mt-2 max-w-xl text-sm leading-6 text-muted">
                Ajoutez les informations et les photos du produit.
              </p>
            </div>
            {!busy && (
              <button
                className="min-h-10 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-surface-elevated"
                onClick={closeEditor}
                type="button"
              >
                Retour au catalogue
              </button>
            )}
          </div>
          <AdminProductForm
            busy={busy}
            creating={isCreating}
            key={isCreating ? "new-product" : editor.id}
            nextOrder={
              products.reduce(
                (largest, product) => Math.max(largest, product.order ?? 0),
                0,
              ) + 1
            }
            onCancel={closeEditor}
            onSave={saveProduct}
            onUploadImage={(file) => uploadProductImage(user, file)}
            product={isCreating ? null : editor}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Catalogue
              </p>
              <h2 className="m-0 font-display text-2xl font-bold">
                Vos produits
              </h2>
              <p className="mb-0 mt-1 text-sm text-muted">
                {products.length} produit{products.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
              disabled={busy}
              onClick={startNewProduct}
              type="button"
            >
              <Plus aria-hidden="true" size={17} />
              Créer un produit
            </button>
          </div>
          <label className="mt-5 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search aria-hidden="true" className="shrink-0 text-muted" size={18} />
            <span className="sr-only">Rechercher un produit</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un produit…"
              type="search"
              value={search}
            />
          </label>
        </div>
        {error && (
          <p
            className="mx-5 mt-4 rounded-xl bg-error-background p-4 text-sm text-error sm:mx-6"
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className="mx-5 mt-4 rounded-xl bg-success-background p-4 text-sm text-success sm:mx-6"
            role="status"
          >
            {notice}
          </p>
        )}
        <ul className="m-0 grid list-none gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const imageUrl = getProductImageUrl(product);
            const price =
              product.price?.amount ??
              product.price ??
              product.priceTiers?.[0]?.pricePerDay;

            return (
              <li
                className="overflow-hidden rounded-2xl border border-border/70 bg-background transition hover:border-primary/40 hover:shadow-md"
                key={product.id}
              >
                <div className="relative aspect-[4/3] bg-surface-elevated">
                  {imageUrl ? (
                    <Image
                      alt={product.name}
                      className="object-cover"
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                      src={imageUrl}
                      unoptimized
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
                      <ImagePlus aria-hidden="true" size={32} />
                      <span className="text-xs">Aucune photo</span>
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                      product.active
                        ? "bg-success-background text-success"
                        : "bg-background/90 text-muted"
                    }`}
                  >
                    {product.active ? "Publié" : "Masqué"}
                  </span>
                </div>
                <div className="grid gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="m-0 truncate text-base font-bold">
                      {product.name}
                    </h3>
                    <p className="mb-0 mt-1 truncate text-xs capitalize text-muted">
                      {product.category?.replaceAll("_", " ")}
                    </p>
                    {/* NOUVEAU : stock visible directement dans la liste */}
                    <StockLine product={product} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">
                      {Number.isFinite(Number(price))
                        ? `${Number(price)} €`
                        : "Prix non défini"}
                      {product.price?.unit === "day" ? " / jour" : ""}
                    </span>
                    <div className="flex gap-2">
                      <button
                        aria-label={`Modifier ${product.name}`}
                        className="flex size-10 items-center justify-center rounded-full border border-border transition hover:bg-surface-elevated disabled:opacity-50"
                        disabled={busy}
                        onClick={() => selectProduct(product)}
                        title={`Modifier ${product.name}`}
                        type="button"
                      >
                        <Pencil aria-hidden="true" size={16} />
                      </button>
                      <button
                        aria-label={`Supprimer ${product.name}`}
                        className="flex size-10 items-center justify-center rounded-full border border-border text-error transition hover:bg-error-background disabled:opacity-50"
                        disabled={busy}
                        onClick={() => void removeProduct(product)}
                        title={`Supprimer ${product.name}`}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          {visibleProducts.length === 0 && (
            <li className="rounded-2xl bg-background px-4 py-8 text-center text-sm text-muted">
              {search
                ? "Aucun produit ne correspond à votre recherche."
                : "Aucun produit à afficher."}
            </li>
          )}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4 sm:px-6">
          <span className="truncate text-xs text-muted">
            Connecté en tant que {user.email}
          </span>
          <div className="flex gap-2">
            <button
              aria-label="Actualiser la liste"
              className="flex size-10 items-center justify-center rounded-full border border-border transition hover:bg-surface-elevated disabled:opacity-50"
              disabled={busy}
              onClick={() => void loadProducts(user)}
              title="Actualiser la liste"
              type="button"
            >
              <RefreshCw
                aria-hidden="true"
                className={busy ? "animate-spin" : ""}
                size={16}
              />
            </button>
            <button
              className="min-h-10 rounded-full border border-border px-3 text-xs font-semibold transition hover:bg-surface-elevated"
              onClick={() => void signOut(auth)}
              type="button"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}