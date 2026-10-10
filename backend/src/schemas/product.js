const { z } = require("zod");

const locales = ["fr", "en", "de", "it", "pl", "pt"];

const translationSchema = z.object({
  name: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  description: z.string().trim().min(1),
  highlights: z.array(z.string().trim().min(1)).length(3),
});

const priceTierSchema = z.object({
  minDays: z.number().int().positive(),
  pricePerDay: z.number().finite().nonnegative(),
});

const productSchema = z
  .object({
    id: z.string().trim().regex(/^[a-z0-9-]{1,80}$/i),
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    category: z.string().trim().min(1),
    type: z.enum(["vehicle", "tour", "free_rental"]),
    order: z.number().int().positive(),
    stock: z.number().int().positive().optional(),
    currency: z.literal("EUR"),
    price: z.object({
      amount: z.number().finite().nonnegative(),
      currency: z.string().min(1),
      unit: z.string().min(1),
    }),
    active: z.boolean(),
    isTestData: z.boolean(),
    images: z.array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1).optional(),
      }),
    ),
    translations: z.object({
      fr: translationSchema,
      en: translationSchema,
      de: translationSchema,
      it: translationSchema,
      pl: translationSchema,
      pt: translationSchema,
    }),
    priceTiers: z.array(priceTierSchema).optional(),
    specs: z
      .object({
        engine: z.string(),
        fuel: z.string(),
        transmission: z.string(),
        passengers: z.number().int().positive(),
      })
      .optional(),
    duration: z.number().int().positive().optional(),
    capacityPerSlot: z.number().int().positive().optional(),
  })
  .passthrough()
  .superRefine((product, context) => {
    if (product.type === "vehicle") {
      if (!product.stock) {
        context.addIssue({
          code: "custom",
          path: ["stock"],
          message: "Vehicles require a positive stock value.",
        });
      }

      if (!product.priceTiers || product.priceTiers.length !== 4) {
        context.addIssue({
          code: "custom",
          path: ["priceTiers"],
          message: "Vehicles require four price tiers.",
        });
      } else if (
        product.priceTiers.map((tier) => tier.minDays).join(",") !== "1,3,7,14"
      ) {
        context.addIssue({
          code: "custom",
          path: ["priceTiers"],
          message: "Vehicle price tiers must start at 1, 3, 7 and 14 days.",
        });
      }

      if (!product.specs) {
        context.addIssue({
          code: "custom",
          path: ["specs"],
          message: "Vehicles require specs.",
        });
      }
    }
    if (product.type === "tour" && (!product.duration || !product.capacityPerSlot)) {
      context.addIssue({
        code: "custom",
        path: ["duration"],
        message: "Tours require duration and capacityPerSlot.",
      });
    }
  });

function validateProduct(product) {
  const result = productSchema.safeParse(product);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid product ${product?.id ?? "(unknown)"}: ${details}`);
  }
  return result.data;
}

module.exports = { productSchema, validateProduct, locales };
