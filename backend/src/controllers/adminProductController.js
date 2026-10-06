const { productSchema } = require("../schemas/product");
const productService = require("../services/productService");

const VALID_ID = /^[a-z0-9-]{1,80}$/i;

function parseProduct(body) {
  const result = productSchema.safeParse(body);
  if (result.success) return { product: result.data };

  return {
    error: result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; "),
  };
}

async function getProducts(req, res) {
  try {
    const products = await productService.getAllProductsForAdmin();
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Admin get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}

async function getProduct(req, res) {
  const { id } = req.params;
  if (!VALID_ID.test(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { createdAt, updatedAt, ...editableProduct } = product;
    return res.status(200).json({
      success: true,
      product: { id: product.id, ...editableProduct },
    });
  } catch (error) {
    console.error("Admin get product error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  const parsed = parseProduct(req.body);
  if (parsed.error) {
    return res.status(400).json({ success: false, message: "Invalid product", details: parsed.error });
  }

  try {
    const product = await productService.createProduct(parsed.product);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    if (error.code === 6 || error.code === "already-exists") {
      return res.status(409).json({ success: false, message: "A product with this ID already exists" });
    }
    console.error("Admin create product error:", error);
    return res.status(500).json({ success: false, message: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  if (!VALID_ID.test(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const parsed = parseProduct(req.body);
  if (parsed.error) {
    return res.status(400).json({ success: false, message: "Invalid product", details: parsed.error });
  }
  if (parsed.product.id !== id) {
    return res.status(400).json({ success: false, message: "Product ID cannot be changed" });
  }

  try {
    const product = await productService.updateProduct(id, parsed.product);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Admin update product error:", error);
    return res.status(500).json({ success: false, message: "Failed to update product" });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  if (!VALID_ID.test(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const deleted = await productService.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, id });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
