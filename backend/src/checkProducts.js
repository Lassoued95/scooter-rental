const { db } = require("./config/firebase");
const { locales } = require("./schemas/product");

function getProductIssues(product) {
  const issues = [];

  if (typeof product.name !== "string" || !product.name.trim()) {
    issues.push("base name");
  }
  if (!["vehicle", "tour", "free_rental"].includes(product.type)) {
    issues.push("valid type");
  }
  if (!Number.isInteger(product.order) || product.order < 1) {
    issues.push("order");
  }

  for (const locale of locales) {
    const translation = product.translations?.[locale];
    if (!translation) {
      issues.push(`translation:${locale}`);
      continue;
    }
    for (const field of ["name", "tagline", "description"]) {
      if (typeof translation[field] !== "string" || !translation[field].trim()) {
        issues.push(`${locale}:${field}`);
      }
    }
    if (
      !Array.isArray(translation.highlights) ||
      translation.highlights.length !== 3 ||
      translation.highlights.some(
        (highlight) => typeof highlight !== "string" || !highlight.trim(),
      )
    ) {
      issues.push(`${locale}:highlights`);
    }
  }

  if (
    product.type === "vehicle" &&
    (!Array.isArray(product.priceTiers) ||
      product.priceTiers.length !== 4 ||
      product.priceTiers.some(
        (tier) =>
          !Number.isInteger(tier.minDays) ||
          !Number.isFinite(tier.pricePerDay),
      ))
  ) {
    issues.push("priceTiers");
  }

  return issues;
}

async function checkProducts() {
  try {
    const snapshot = await db.collection("products").get();
    const rows = snapshot.docs.map((doc) => {
      const issues = getProductIssues(doc.data());
      return {
        id: doc.id,
        type: doc.get("type") ?? "(missing)",
        status: issues.length === 0 ? "OK" : "FAIL",
        issues: issues.join(", ") || "-",
      };
    });

    console.table(rows);
    const failed = rows.filter((row) => row.status === "FAIL");
    console.log(`${rows.length - failed.length}/${rows.length} products valid.`);
    if (failed.length) process.exitCode = 1;
  } catch {
    console.error("Product check failed while reading the Firestore products collection.");
    process.exitCode = 1;
  }
}

checkProducts();
