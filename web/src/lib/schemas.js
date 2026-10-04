import { z } from "zod";

export const localizedTextSchema = z.object({
  fr: z.string().min(1),
  en: z.string().min(1),
  de: z.string().min(1),
});

export const priceTierSchema = z.object({
  minDays: z.number().int().positive(),
  pricePerDay: z.number().positive(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["rental", "tour"]),
  name: localizedTextSchema,
  description: localizedTextSchema,
  price: z.number().nonnegative(),
  priceTiers: z.array(priceTierSchema).optional(),
  stock: z.number().int().nonnegative().optional(),
  capacityPerSlot: z.number().int().positive().optional(),
  durationHours: z.number().positive().optional(),
  highlights: z
    .object({
      fr: z.array(z.string()),
      en: z.array(z.string()),
      de: z.array(z.string()),
    })
    .optional(),
  meetingPoint: z.string().optional(),
  specs: z
    .object({
      engineCc: z.number().int().positive(),
      passengers: z.number().int().positive(),
      luggage: z.number().int().nonnegative(),
      fuel: z.string(),
    })
    .optional(),
  active: z.boolean(),
});

export const optionSchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  price: z.number().nonnegative(),
  active: z.boolean(),
});

export const reservationSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  type: z.enum(["rental", "tour"]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  quantity: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.email(),
    hotel: z.string().optional(),
    message: z.string().optional(),
  }),
});

export const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.email(),
  hotel: z.string().optional(),
});

export const reviewSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
  date: z.string().date(),
});

export const faqSchema = z.object({
  id: z.string().min(1),
  question: localizedTextSchema,
  answer: localizedTextSchema,
});

export const settingsSchema = z.object({
  businessName: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.email(),
  eurToTnd: z.number().positive(),
  cancellationText: z.string(),
  hotelPickupPrice: z.number().nonnegative(),
  facebook: z.string(),
  instagram: z.string(),
});

export const tourSlotSchema = z.object({
  id: z.string().min(1),
  date: z.string().date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().positive(),
});
