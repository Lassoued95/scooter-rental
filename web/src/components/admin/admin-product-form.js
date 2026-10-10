"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Save, X } from "lucide-react";

const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "de", label: "Allemand" },
  { code: "it", label: "Italien" },
  { code: "pl", label: "Polonais" },
  { code: "pt", label: "Portugais" },
];

const CATEGORIES = [
  { value: "scooter", label: "Scooter" },
  { value: "electric_scooter", label: "Scooter électrique" },
  { value: "three_wheel_scooter", label: "Scooter à trois roues" },
  { value: "electric_bike", label: "Vélo électrique" },
  { value: "bicycle", label: "Vélo" },
  { value: "tour", label: "Excursion" },
 
];

const VEHICLE_PRICE_DAYS = [1, 3, 7, 14];
const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const textareaClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "grid gap-2 text-sm font-semibold text-foreground";

function emptyTranslations() {
  return Object.fromEntries(
    LOCALES.map(({ code }) => [
      code,
      { name: "", tagline: "", description: "", highlights: ["", "", ""] },
    ]),
  );
}

function newProduct(order = 1) {
  return {
    id: "",
    name: "",
    slug: "",
    category: "scooter",
    type: "vehicle",
    order,
    stock: 1,
    currency: "EUR",
    price: { amount: 20, currency: "EUR", unit: "day" },
    active: true,
    isTestData: false,
    images: [],
    translations: emptyTranslations(),
    priceTiers: VEHICLE_PRICE_DAYS.map((minDays) => ({
      minDays,
      pricePerDay: 20,
    })),
    specs: {
      engine: "50cc",
      fuel: "petrol",
      transmission: "automatic",
      passengers: 2,
    },
  };
}

function prepareProduct(product) {
  const defaults = newProduct();
  const translations = Object.fromEntries(
    LOCALES.map(({ code }) => {
      const source = product.translations?.[code] ?? {};
      return [
        code,
        {
          name: source.name ?? (code === "fr" ? product.name ?? "" : ""),
          tagline: source.tagline ?? "",
          description: source.description ?? "",
          highlights: Array.from(
            { length: 3 },
            (_, index) => source.highlights?.[index] ?? "",
          ),
        },
      ];
    }),
  );

  return {
    ...defaults,
    ...product,
    stock: product.stock ?? defaults.stock,
    price: { ...defaults.price, ...product.price },
    specs: { ...defaults.specs, ...product.specs },
    images: (product.images ?? []).map((image) => ({ ...image })),
    priceTiers:
      product.priceTiers?.length === 4
        ? product.priceTiers.map((tier) => ({ ...tier }))
        : defaults.priceTiers,
    translations,
  };
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isTranslationComplete(translation) {
  return Boolean(
    translation?.name?.trim() &&
      translation?.tagline?.trim() &&
      translation?.description?.trim() &&
      translation.highlights?.length === 3 &&
      translation.highlights.every((highlight) => highlight.trim()),
  );
}

function Field({ children, className = "", label, ...props }) {
  return (
    <label className={`${labelClass} ${className}`}>
      <span>{label}</span>
      <input className={inputClass} {...props} />
      {children}
    </label>
  );
}

function SectionHeading({ description, number, title }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary">
        {number}
      </span>
      <div>
        <h3 className="m-0 text-lg font-bold">{title}</h3>
        {description && (
          <p className="mb-0 mt-1 text-sm leading-6 text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}

export function AdminProductForm({
  busy,
  creating,
  nextOrder,
  onCancel,
  onSave,
  onUploadImage,
  product,
}) {
  const [draft, setDraft] = useState(() =>
    prepareProduct(product ?? newProduct(nextOrder)),
  );
  const [activeLocale, setActiveLocale] = useState("fr");
  const [formError, setFormError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updatePrice(key, value) {
    setDraft((current) => ({
      ...current,
      price: { ...current.price, [key]: value },
    }));
  }

  function updateSpec(key, value) {
    setDraft((current) => ({
      ...current,
      specs: { ...current.specs, [key]: value },
    }));
  }

  function updateTranslation(key, value) {
    setDraft((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [activeLocale]: {
          ...current.translations[activeLocale],
          [key]: value,
        },
      },
    }));
  }

  function updateHighlight(index, value) {
    setDraft((current) => {
      const translation = current.translations[activeLocale];
      const highlights = [...translation.highlights];
      highlights[index] = value;
      return {
        ...current,
        translations: {
          ...current.translations,
          [activeLocale]: { ...translation, highlights },
        },
      };
    });
  }

  async function handleImageSelection(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const invalidFile = files.find(
      (file) =>
        (file.type && !file.type.startsWith("image/")) ||
        file.size > 10 * 1024 * 1024,
    );
    if (invalidFile) {
      setPhotoError("Choisissez des fichiers image de 10 Mo maximum.");
      return;
    }

    setPhotoError("");
    setUploadingImages(true);
    let pendingPreviewUrl;
    let pendingLocalKey;
    try {
      for (const [index, file] of files.entries()) {
        const localKey = `${Date.now()}-${index}-${file.name}`;
        const previewUrl = URL.createObjectURL(file);
        pendingLocalKey = localKey;
        pendingPreviewUrl = previewUrl;
        setDraft((current) => ({
          ...current,
          images: [
            ...current.images,
            { localKey, previewUrl, uploading: true },
          ],
        }));

        const image = await onUploadImage(file);
        setDraft((current) => ({
          ...current,
          images: current.images.map((currentImage) =>
            currentImage.localKey === localKey
              ? image
              : currentImage,
          ),
        }));
        URL.revokeObjectURL(previewUrl);
        pendingPreviewUrl = undefined;
        pendingLocalKey = undefined;
      }
    } catch (error) {
      setPhotoError(error.message || "L’envoi de l’image a échoué.");
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
      setDraft((current) => ({
        ...current,
        images: current.images.filter(
          (image) => image.localKey !== pendingLocalKey,
        ),
      }));
    } finally {
      setUploadingImages(false);
    }
  }

  function updatePriceTier(index, value) {
    setDraft((current) => ({
      ...current,
      priceTiers: current.priceTiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, pricePerDay: value } : tier,
      ),
    }));
  }

  function handleNameChange(value) {
    setDraft((current) => {
      const previousFrenchName = current.translations.fr.name;
      const shouldUpdateId =
        creating && (!current.id || current.id === slugify(previousFrenchName));
      const shouldUpdateSlug =
        creating && (!current.slug || current.slug === slugify(previousFrenchName));
      const generatedId = slugify(value);
      const french = current.translations.fr;

      return {
        ...current,
        name: value,
        id: shouldUpdateId ? generatedId : current.id,
        slug: shouldUpdateSlug ? generatedId : current.slug,
        translations: {
          ...current.translations,
          fr: { ...french, name: value },
        },
      };
    });
  }

  function handleTypeChange(type) {
    setDraft((current) => ({
      ...current,
      type,
      category:
        type === "tour"
          ? "tour"
          : type === "free_rental"
            ? "rental"
            : current.category === "tour" || current.category === "rental"
              ? "scooter"
              : current.category,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const missingTranslation = LOCALES.find(
      ({ code }) => !isTranslationComplete(draft.translations[code]),
    );
    if (missingTranslation) {
      setActiveLocale(missingTranslation.code);
      setFormError(
        `Complétez le nom, l’accroche, la description et les trois points forts en ${missingTranslation.label.toLowerCase()}.`,
      );
      return;
    }

    if (draft.type === "vehicle" && draft.priceTiers.length !== 4) {
      setFormError("Un véhicule doit avoir quatre tarifs de location.");
      return;
    }

    const name = draft.translations.fr.name.trim();
    onSave({
      ...draft,
      name,
      id: draft.id.trim() || slugify(name),
      slug: draft.slug.trim() || slugify(name),
      order: Number(draft.order),
      price: {
        ...draft.price,
        amount: Number(draft.price.amount),
      },
      images: draft.images
        .filter((image) => image.url.trim())
        .map((image) => ({
          url: image.url.trim(),
          ...(image.publicId?.trim()
            ? { publicId: image.publicId.trim() }
            : {}),
        })),
      ...(draft.type === "vehicle"
        ? {
            stock: Number(draft.stock),
            priceTiers: draft.priceTiers.map((tier, index) => ({
              minDays: VEHICLE_PRICE_DAYS[index],
              pricePerDay: Number(tier.pricePerDay),
            })),
            specs: {
              ...draft.specs,
              passengers: Number(draft.specs.passengers),
            },
          }
        : { stock: undefined, priceTiers: undefined, specs: undefined }),
      ...(draft.type === "tour"
        ? {
            duration: Number(draft.duration || 300),
            capacityPerSlot: Number(draft.capacityPerSlot || 8),
          }
        : { duration: undefined, capacityPerSlot: undefined }),
      ...(draft.type === "free_rental" ? { rentalType: "free" } : {}),
    });
  }

  const activeTranslation = draft.translations[activeLocale];

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {formError && (
        <p
          className="m-0 rounded-xl border border-error/20 bg-error-background px-4 py-3 text-sm leading-6 text-error"
          role="alert"
        >
          {formError}
        </p>
      )}

      <section className="rounded-2xl border border-border/70 bg-background/50 p-5 sm:p-6">
        <SectionHeading
          description="Les informations utilisées pour identifier et afficher le produit."
          number="1"
          title="Informations générales"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            autoComplete="off"
            label="Nom en français"
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Ex. Scooter électrique 50 cc"
            required
            value={draft.translations.fr.name}
          />
          <label className={labelClass}>
            <span>Type de produit</span>
            <select
              className={inputClass}
              onChange={(event) => handleTypeChange(event.target.value)}
              value={draft.type}
            >
              <option value="vehicle">Véhicule à louer</option>
              <option value="tour">Excursion</option>
              
            </select>
          </label>
          <label className={labelClass}>
            <span>Catégorie</span>
            <select
              className={inputClass}
              onChange={(event) => updateField("category", event.target.value)}
              value={draft.category}
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>
       
      </section>

      <section className="rounded-2xl border border-border/70 bg-background/50 p-5 sm:p-6">
        <SectionHeading
          description="Définissez un prix de base et, pour les véhicules, les tarifs selon la durée."
          number="2"
          title="Tarifs"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prix de base (€)"
            min="0"
            onChange={(event) => updatePrice("amount", event.target.value)}
            required
            step="0.01"
            type="number"
            value={draft.price.amount}
          />
          <label className={labelClass}>
            <span>Unité du prix</span>
            <select
              className={inputClass}
              onChange={(event) => updatePrice("unit", event.target.value)}
              value={draft.price.unit}
            >
              <option value="day">Par jour</option>
              <option value="person">Par personne</option>
              <option value="tour">Par excursion</option>
            </select>
          </label>
        </div>
        {draft.type === "vehicle" && (
          <div className="mt-5">
            <h4 className="mb-3 mt-0 text-sm font-bold">
              Prix par jour selon la durée
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {VEHICLE_PRICE_DAYS.map((days, index) => (
                <Field
                  key={days}
                  label={days === 1 ? "1 jour (€ / jour)" : `${days} jours ou plus (€ / jour)`}
                  min="0"
                  onChange={(event) =>
                    updatePriceTier(
                      index,
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  required
                  step="0.01"
                  type="number"
                  value={draft.priceTiers[index]?.pricePerDay ?? ""}
                />
              ))}
            </div>
          </div>
        )}
        {draft.type === "tour" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Durée (minutes)"
              min="1"
              onChange={(event) => updateField("duration", event.target.value)}
              required
              type="number"
              value={draft.duration ?? 300}
            />
            <Field
              label="Places par départ"
              min="1"
              onChange={(event) =>
                updateField("capacityPerSlot", event.target.value)
              }
              required
              type="number"
              value={draft.capacityPerSlot ?? 8}
            />
          </div>
        )}
      </section>

      {draft.type === "vehicle" && (
        <section className="rounded-2xl border border-border/70 bg-background/50 p-5 sm:p-6">
          <SectionHeading
            description="Ces détails aident les clients à choisir le véhicule qui leur convient."
            number="3"
            title="Caractéristiques du véhicule"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nombre de véhicules (stock)"
              min="1"
              onChange={(event) => updateField("stock", event.target.value)}
              required
              step="1"
              type="number"
              value={draft.stock}
            />
            <Field
              label="Cylindrée / moteur"
              onChange={(event) => updateSpec("engine", event.target.value)}
              placeholder="Ex. 50cc ou électrique"
              required
              value={draft.specs.engine}
            />
            <label className={labelClass}>
              <span>Énergie</span>
              <select
                className={inputClass}
                onChange={(event) => updateSpec("fuel", event.target.value)}
                value={draft.specs.fuel}
              >
                <option value="petrol">Essence</option>
                <option value="electric">Électricité</option>
                <option value="none">Aucune</option>
              </select>
            </label>
            <Field
              label="Nombre de passagers"
              min="1"
              onChange={(event) =>
                updateSpec(
                  "passengers",
                  event.target.value === ""
                    ? ""
                    : Number(event.target.value),
                )
              }
              required
              type="number"
              value={draft.specs.passengers}
            />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/70 bg-background/50 p-5 sm:p-6">
        <SectionHeading
          description="Choisissez des photos depuis votre appareil."
          number={draft.type === "vehicle" ? "4" : "3"}
          title="Photos"
        />
        <div className="grid gap-3">
          {draft.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {draft.images.map((image, index) => (
                <div
                  className="relative overflow-hidden rounded-xl border border-border/70 bg-surface"
                  key={`${index}-${image.publicId ?? image.url}`}
                >
                  {image.previewUrl || image.url ? (
                    <Image
                      alt={`Aperçu de la photo ${index + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                      height={240}
                      src={image.previewUrl ?? image.url}
                      unoptimized
                      width={320}
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted">
                      Aperçu indisponible
                    </div>
                  )}
                  <button
                    aria-label={`Supprimer la photo ${index + 1}`}
                    className="absolute right-2 top-2 min-h-9 rounded-lg bg-background/95 px-3 text-sm font-semibold text-error shadow"
                    disabled={uploadingImages}
                    onClick={() =>
                      updateField(
                        "images",
                        draft.images.filter(
                          (_, imageIndex) => imageIndex !== index,
                        ),
                      )
                    }
                    type="button"
                  >
                    Supprimer
                  </button>
                  {image.uploading && (
                    <span
                      className="absolute inset-x-0 bottom-0 bg-background/90 px-3 py-2 text-center text-xs font-semibold"
                      role="status"
                    >
                      Envoi en cours…
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary/30">
            <ImagePlus aria-hidden="true" size={18} />
            {uploadingImages ? "Envoi des photos…" : "Ajouter des photos"}
            <input
              accept="image/*"
              className="sr-only"
              disabled={busy || uploadingImages}
              multiple
              onChange={handleImageSelection}
              type="file"
            />
          </label>
          <p className="m-0 text-xs leading-5 text-muted">
            Formats image courants, 10 Mo maximum par photo.
          </p>
          {photoError && (
            <p
              className="m-0 rounded-xl bg-error-background px-4 py-3 text-sm leading-6 text-error"
              role="alert"
            >
              {photoError}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-background/50 p-5 sm:p-6">
        <SectionHeading
          description="Rédigez le contenu à afficher dans chacune des langues proposées."
          number={draft.type === "vehicle" ? "5" : "4"}
          title="Descriptions et traductions"
        />
        <div
          aria-label="Langue de la traduction"
          className="mb-5 flex flex-wrap gap-2"
          role="tablist"
        >
          {LOCALES.map(({ code, label }) => {
            const complete = isTranslationComplete(draft.translations[code]);
            return (
              <button
                aria-selected={activeLocale === code}
                className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition ${
                  activeLocale === code
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:bg-surface-elevated"
                }`}
                key={code}
                onClick={() => setActiveLocale(code)}
                role="tab"
                type="button"
              >
                {label}
                <span aria-label={complete ? "Complète" : "À compléter"}>
                  {complete ? "✓" : "·"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-4" role="tabpanel">
          <label className={labelClass}>
            <span>Nom du produit — {LOCALES.find(({ code }) => code === activeLocale).label.toLowerCase()}</span>
            <input
              className={inputClass}
              onChange={(event) =>
                activeLocale === "fr"
                  ? handleNameChange(event.target.value)
                  : updateTranslation("name", event.target.value)
              }
              required={activeLocale === "fr"}
              value={activeTranslation.name}
            />
          </label>
          <label className={labelClass}>
            <span>Accroche</span>
            <input
              className={inputClass}
              onChange={(event) =>
                updateTranslation("tagline", event.target.value)
              }
              placeholder="Une courte phrase pour présenter le produit"
              required
              value={activeTranslation.tagline}
            />
          </label>
          <label className={labelClass}>
            <span>Description</span>
            <textarea
              className={`${textareaClass} min-h-28`}
              onChange={(event) =>
                updateTranslation("description", event.target.value)
              }
              placeholder="Décrivez le produit et ses avantages"
              required
              value={activeTranslation.description}
            />
          </label>
          <fieldset className="grid gap-3 border-0 p-0">
            <legend className="mb-3 text-sm font-semibold">
              Trois points forts
            </legend>
            {activeTranslation.highlights.map((highlight, index) => (
              <label
                className={labelClass}
                htmlFor={`highlight-${activeLocale}-${index}`}
                key={`${activeLocale}-${index}`}
              >
                <span>Point fort {index + 1}</span>
                <input
                  className={inputClass}
                  id={`highlight-${activeLocale}-${index}`}
                  onChange={(event) =>
                    updateHighlight(index, event.target.value)
                  }
                  placeholder="Ex. Casque inclus"
                  required
                  value={highlight}
                />
              </label>
            ))}
          </fieldset>
        </div>
      </section>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-xl backdrop-blur">
        <p className="m-0 text-xs leading-5 text-muted sm:text-sm">
          {LOCALES.filter(({ code }) =>
            isTranslationComplete(draft.translations[code]),
          ).length}{" "}
          langues sur {LOCALES.length} renseignées
        </p>
        <div className="flex gap-2">
          <button
            className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold hover:bg-surface-elevated"
            disabled={busy || uploadingImages}
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" size={17} />
            Annuler
          </button>
          <button
            className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            disabled={busy || uploadingImages}
            type="submit"
          >
            <Save aria-hidden="true" size={17} />
            {uploadingImages
              ? "Envoi des photos…"
              : busy
              ? "Enregistrement…"
              : creating
                ? "Créer le produit"
                : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
