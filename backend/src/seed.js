const { db } = require("./config/firebase");
const { enrichProduct } = require("./product-enrichment");
const { validateProduct } = require("./schemas/product");

const products = [
  // =========================
  // SCOOTERS
  // =========================

  {
    id: "formula-50cc",
    name: "Formula 50cc",
    slug: "formula-50cc",
    category: "scooter",
    engine: "50cc",
    fuel: "petrol",
    transmission: "automatic",
    stock: 4,
    price: {
      amount: 20,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "zimota-tapo-50cc",
    name: "Zimota Tapo 50cc",
    slug: "zimota-tapo-50cc",
    category: "scooter",
    engine: "50cc",
    fuel: "petrol",
    transmission: "automatic",
    stock: 6,
    price: {
      amount: 20,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "zimota-sinus-125cc",
    name: "Zimota Sinus 125cc",
    slug: "zimota-sinus-125cc",
    category: "scooter",
    engine: "125cc",
    fuel: "petrol",
    transmission: "automatic",
    stock: 6,
    price: {
      amount: 25,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "tank-125",
    name: "Tank 125",
    slug: "tank-125",
    category: "scooter",
    engine: "125cc",
    fuel: "petrol",
    transmission: "automatic",
    stock: 6,
    price: {
      amount: 25,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "tailg-electric-40cc",
    name: "Tailg Electric 40cc",
    slug: "tailg-electric-40cc",
    category: "electric_scooter",
    engine: "40cc",
    fuel: "electric",
    transmission: "automatic",
    stock: 2,
    price: {
      amount: 25,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "costa-first-50cc",
    name: "Costa First 50cc",
    slug: "costa-first-50cc",
    category: "scooter",
    engine: "50cc",
    fuel: "petrol",
    transmission: "automatic",
    stock: 6,
    price: {
      amount: 20,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },
  {
  id: "dayun-sniper-125cc",
  name: "Scooter DAYUN SNIPER 125CC",
  slug: "dayun-sniper-125cc",
  category: "scooter",
  engine: "125cc",
  fuel: "petrol",
  transmission: "automatic",
  stock: 6,
  price: {
    amount: 25,
    currency: "EUR",
    unit: "day",
  },
  active: true,
  isTestData: true,
},

  {
    id: "elegance-50cc",
    name: "Elegance 50cc",
    slug: "elegance-50cc",
    category: "scooter",
    engine: "50cc",
    fuel: "petrol",
    transmission: "automatic",
    stock: 6,
    price: {
      amount: 20,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  // =========================
  // BIKES
  // =========================

  {
    id: "velo-electrique",
    name: "Vélo électrique",
    slug: "velo-electrique",
    category: "electric_bike",
    engine: "electric",
    fuel: "electric",
    transmission: "automatic",
    stock: 9,
    price: {
      amount: 15,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "scooter-3-roues",
    name: "Scooter 3 roues",
    slug: "scooter-3-roues",
    category: "three_wheel_scooter",
    engine: "unknown",
    fuel: "petrol",
    transmission: "automatic",
    stock: 2,
    price: {
      amount: 30,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "velo-normal",
    name: "Vélo normal",
    slug: "velo-normal",
    category: "bicycle",
    engine: "none",
    fuel: "none",
    transmission: "manual",
    stock: 4,
    price: {
      amount: 10,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },

  // =========================
  // TOURS
  // =========================

  {
    id: "tour-de-lile",
    name: "Tour de l'île de Djerba",
    slug: "tour-de-lile",
    category: "tour",
    tourType: "island",
    price: {
      amount: 20,
      currency: "EUR",
      unit: "person",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "tour-sud-djerba",
    name: "Tour du Sud de Djerba",
    slug: "tour-sud-djerba",
    category: "tour",
    tourType: "south",
    price: {
      amount: 20,
      currency: "EUR",
      unit: "person",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "tour-nord-djerba",
    name: "Tour du Nord de Djerba",
    slug: "tour-nord-djerba",
    category: "tour",
    tourType: "north",
    price: {
      amount: 20,
      currency: "EUR",
      unit: "person",
    },
    active: true,
    isTestData: true,
  },

  {
    id: "location-free",
    name: "Location Free",
    slug: "location-free",
    category: "rental",
    rentalType: "free",
    price: {
      amount: 20,
      currency: "EUR",
      unit: "day",
    },
    active: true,
    isTestData: true,
  },
];

async function seedProducts() {
  try {
    console.log("🌱 Starting Firestore seed...");

    const batch = db.batch();
    const validatedProducts = products.map((product) =>
      validateProduct(enrichProduct(product)),
    );

    validatedProducts.forEach((product) => {
      const productRef = db.collection("products").doc(product.id);

      const { id, ...data } = product;

      batch.set(productRef, {
        ...data,
        updatedAt: new Date(),
      }, { merge: true });
    });

    await batch.commit();

    console.log(`✅ ${validatedProducts.length} products seeded successfully.`);
    console.log("📦 Collection: products");
    console.log("🎉 Seed completed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed during product validation or Firestore write.");
    process.exitCode = 1;
  }
}

seedProducts();