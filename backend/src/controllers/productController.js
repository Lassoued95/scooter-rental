const productService = require("../services/productService");

// Les produits changent rarement : le navigateur et le CDN peuvent les garder en cache.
// Cela protège aussi le quota de lectures gratuit de Firestore.
const PUBLIC_CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

// Les identifiants sont de la forme "dayun-sniper-125cc"
const VALID_ID = /^[a-z0-9-]{1,80}$/i;

const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.set("Cache-Control", PUBLIC_CACHE);
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // évite qu'un identifiant bizarre (avec "/" par exemple) fasse planter Firestore
    if (!VALID_ID.test(id)) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.set("Cache-Control", PUBLIC_CACHE);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
};