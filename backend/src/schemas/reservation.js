const { z } = require("zod");

const locales = ["fr", "en", "de", "it", "pl", "pt"];

const sanitizeText = (value) => {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value)
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const itemSchema = z.object({
  productId: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/i),
  quantity: z.number().int().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departureTime: z.enum(["08:00", "14:00"]).optional(),
}).superRefine((item, ctx) => {
  const hasVehicleRange = Boolean(item.startDate && item.endDate);
  const hasTourDate = Boolean(item.date);

  if (!hasVehicleRange && !hasTourDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["startDate"],
      message: "Either startDate/endDate or date is required.",
    });
  }

  if (hasVehicleRange && (!item.startDate || !item.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "Both startDate and endDate are required for rentals.",
    });
  }

  if (hasTourDate && hasVehicleRange) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["date"],
      message: "Use either date for tours or a rental range for vehicles.",
    });
  }

  if (hasVehicleRange && item.quantity > 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["quantity"],
      message: "Rental quantity cannot exceed 10.",
    });
  }

  if (hasTourDate && !item.departureTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["departureTime"],
      message: "A departure time is required for tours.",
    });
  }

  if (!hasTourDate && item.departureTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["departureTime"],
      message: "Departure times are only valid for tours.",
    });
  }
});

const customerSchema = z.object({
  fullName: z.string().trim().min(2).max(120).transform(sanitizeText),
  phone: z.string().trim().min(6).max(20).regex(/^[+0-9()\-\s]+$/).transform(sanitizeText),
  email: z.string().trim().email().max(254).transform((value) => sanitizeText(value).toLowerCase()),
  hotel: z.string().trim().max(200).optional().transform((value) => (value === undefined ? value : sanitizeText(value))),
  message: z.string().trim().max(500).optional().transform((value) => (value === undefined ? value : sanitizeText(value))),
}).strip();

const reservationSchema = z.object({
  items: z.array(itemSchema).min(1).max(10),
  customer: customerSchema,
  locale: z.enum(locales),
  termsAccepted: z.literal(true),
  website: z.string().trim().max(500).optional(),
}).superRefine((reservation, ctx) => {
  if (typeof reservation.website === "string" && reservation.website.trim().length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["website"],
      message: "Bot field must be empty.",
    });
  }
}).strip();

module.exports = {
  locales,
  reservationSchema,
  sanitizeText,
};
