/** @type {import("@/types").Product[]} */
export const products = [
  {
    id: "scooter-50cc",
    slug: "scooter-50cc",
    type: "rental",
    name: { fr: "Scooter 50cc", en: "50cc Scooter", de: "50-ccm-Roller" },
    description: {
      fr: "Un scooter léger et facile à conduire pour découvrir Djerba.",
      en: "A light, easy-to-ride scooter for discovering Djerba.",
      de: "Ein leichter, einfach zu fahrender Roller, um Djerba zu entdecken.",
    },
    price: 18,
    priceTiers: [
      { minDays: 1, pricePerDay: 18 },
      { minDays: 3, pricePerDay: 16 },
      { minDays: 7, pricePerDay: 14 },
      { minDays: 14, pricePerDay: 12 },
    ],
    stock: 5,
    specs: { engineCc: 50, passengers: 2, luggage: 1, fuel: "Petrol" },
    active: true,
  },
  {
    id: "scooter-125-auto",
    slug: "scooter-125-automatic",
    type: "rental",
    name: {
      fr: "Scooter 125cc automatique",
      en: "125cc Automatic Scooter",
      de: "125-ccm-Automatikroller",
    },
    description: {
      fr: "Confort et liberté pour parcourir l'île à votre rythme.",
      en: "Comfort and freedom to explore the island at your own pace.",
      de: "Komfort und Freiheit, die Insel im eigenen Tempo zu erkunden.",
    },
    price: 25,
    priceTiers: [
      { minDays: 1, pricePerDay: 25 },
      { minDays: 3, pricePerDay: 22 },
      { minDays: 7, pricePerDay: 19 },
      { minDays: 14, pricePerDay: 17 },
    ],
    stock: 4,
    specs: { engineCc: 125, passengers: 2, luggage: 2, fuel: "Petrol" },
    active: true,
  },
  {
    id: "scooter-125-premium",
    slug: "scooter-125-premium",
    type: "rental",
    name: {
      fr: "Scooter 125cc premium",
      en: "125cc Premium Scooter",
      de: "125-ccm-Premiumroller",
    },
    description: {
      fr: "Un modèle premium confortable pour les longues balades.",
      en: "A comfortable premium model for longer rides.",
      de: "Ein komfortables Premiummodell für längere Ausflüge.",
    },
    price: 32,
    priceTiers: [
      { minDays: 1, pricePerDay: 32 },
      { minDays: 3, pricePerDay: 29 },
      { minDays: 7, pricePerDay: 26 },
      { minDays: 14, pricePerDay: 23 },
    ],
    stock: 3,
    specs: { engineCc: 125, passengers: 2, luggage: 2, fuel: "Petrol" },
    active: true,
  },
  {
    id: "tour-island",
    slug: "island-tour",
    type: "tour",
    name: { fr: "Tour de l'île", en: "Island Tour", de: "Inselrundfahrt" },
    description: {
      fr: "Explorez les villages et les paysages emblématiques de Djerba.",
      en: "Discover Djerba's landmark villages and landscapes.",
      de: "Entdecken Sie Djerbas bekannte Dörfer und Landschaften.",
    },
    price: 55,
    capacityPerSlot: 8,
    durationHours: 5,
    highlights: {
      fr: ["Houmt Souk", "Djerbahood", "Guellala", "Sidi Mahrez"],
      en: ["Houmt Souk", "Djerbahood", "Guellala", "Sidi Mahrez"],
      de: ["Houmt Souk", "Djerbahood", "Guellala", "Sidi Mahrez"],
    },
    meetingPoint: "Mezraya, Djerba",
    active: true,
  },
  {
    id: "tour-south",
    slug: "south-tour",
    type: "tour",
    name: { fr: "Tour du sud", en: "South Tour", de: "Südtour" },
    description: {
      fr: "Villages, artisanat et paysages du sud de l'île.",
      en: "Villages, crafts, and landscapes of the island's south.",
      de: "Dörfer, Kunsthandwerk und Landschaften im Süden der Insel.",
    },
    price: 48,
    capacityPerSlot: 6,
    durationHours: 4,
    highlights: {
      fr: ["Guellala", "Erriadh", "Midoun"],
      en: ["Guellala", "Erriadh", "Midoun"],
      de: ["Guellala", "Erriadh", "Midoun"],
    },
    meetingPoint: "Mezraya, Djerba",
    active: true,
  },
  {
    id: "tour-north",
    slug: "north-tour",
    type: "tour",
    name: { fr: "Tour du nord", en: "North Tour", de: "Nordtour" },
    description: {
      fr: "Une balade côtière vers Houmt Souk et les plages du nord.",
      en: "A coastal ride to Houmt Souk and the northern beaches.",
      de: "Eine Küstentour nach Houmt Souk und zu den Stränden im Norden.",
    },
    price: 45,
    capacityPerSlot: 6,
    durationHours: 4,
    highlights: {
      fr: ["Houmt Souk", "Sidi Mahrez", "Zone du Lagon Bleu"],
      en: ["Houmt Souk", "Sidi Mahrez", "Blue Lagoon area"],
      de: ["Houmt Souk", "Sidi Mahrez", "Blaue Lagune"],
    },
    meetingPoint: "Mezraya, Djerba",
    active: true,
  },
];

/** @type {import("@/types").Option[]} */
export const options = [
  {
    id: "extra-helmet",
    name: { fr: "Casque supplémentaire", en: "Extra helmet", de: "Zusätzlicher Helm" },
    price: 0,
    active: true,
  },
  {
    id: "child-helmet",
    name: { fr: "Casque enfant", en: "Child helmet", de: "Kinderhelm" },
    price: 0,
    active: true,
  },
  {
    id: "phone-holder",
    name: { fr: "Support téléphone", en: "Phone holder", de: "Handyhalterung" },
    price: 2,
    active: true,
  },
  {
    id: "hotel-pickup",
    name: { fr: "Prise en charge à l'hôtel", en: "Hotel pick-up", de: "Abholung am Hotel" },
    price: 0,
    active: true,
  },
];

/** @type {import("@/types").Review[]} */
export const reviews = [
  {
    id: "review-1",
    author: "Camille R.",
    rating: 5,
    text: "Accueil chaleureux et scooter impeccable pour découvrir l'île.",
    date: "2025-06-12",
  },
  {
    id: "review-2",
    author: "Lukas M.",
    rating: 5,
    text: "Sehr freundlich und unkompliziert. Wir hatten eine tolle Zeit.",
    date: "2025-05-28",
  },
];

/** @type {import("@/types").Faq[]} */
export const faqs = [
  {
    id: "faq-payment",
    question: {
      fr: "Quand dois-je payer ?",
      en: "When do I pay?",
      de: "Wann bezahle ich?",
    },
    answer: {
      fr: "Le paiement s'effectue sur place lors de la prise en charge.",
      en: "Payment is made on site when you pick up the scooter.",
      de: "Die Zahlung erfolgt vor Ort bei der Abholung.",
    },
  },
  {
    id: "faq-helmets",
    question: {
      fr: "Les casques sont-ils inclus ?",
      en: "Are helmets included?",
      de: "Sind Helme inklusive?",
    },
    answer: {
      fr: "Oui, les casques sont toujours inclus.",
      en: "Yes, helmets are always included.",
      de: "Ja, Helme sind immer inklusive.",
    },
  },
];

/** @type {import("@/types").Settings} */
export const settings = {
  businessName: "Location Scooter Djerba",
  address: "Mezraya, Djerba, Tunisia",
  phone: "+216 28 340 240",
  whatsapp: "+21628340240",
  email: "contact@example.com",
  eurToTnd: 3.35,
  cancellationText: "Free cancellation up to 24 hours before pick-up.",
  hotelPickupPrice: 0,
  facebook: "",
  instagram: "",
};

/** @type {import("@/types").TourSlot[]} */
export const tourSlots = [
  {
    id: "morning",
    date: "2026-10-05",
    startTime: "09:00",
    endTime: "14:00",
    capacity: 8,
  },
  {
    id: "afternoon",
    date: "2026-10-05",
    startTime: "14:30",
    endTime: "19:30",
    capacity: 8,
  },
];

export const mockReservations = [
  {
    id: "reservation-seed-rental-1",
    productId: "scooter-50cc",
    type: "rental",
    startDate: "2026-10-05",
    endDate: "2026-10-08",
    quantity: 2,
  },
  {
    id: "reservation-seed-tour-1",
    productId: "tour-island",
    type: "tour",
    startDate: "2026-10-05",
    endDate: "2026-10-05",
    slotId: "morning",
    quantity: 3,
  },
];
