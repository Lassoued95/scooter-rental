const { admin, db } = require("../config/firebase");

const productsCollection = db.collection("products");

const getAllProducts = async () => {
  const snapshot = await productsCollection
    .where("active", "==", true)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const getProductById = async (id) => {
  const doc = await productsCollection.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
};

const getAllProductsForAdmin = async () => {
  const snapshot = await productsCollection.get();

  return snapshot.docs
    .map((doc) => {
      const { createdAt, updatedAt, ...product } = doc.data();
      return { id: doc.id, ...product };
    })
    .sort(
      (left, right) =>
        (left.order ?? 0) - (right.order ?? 0) ||
        left.id.localeCompare(right.id),
    );
};

const createProduct = async (product) => {
  const { id, ...data } = product;
  const now = admin.firestore.FieldValue.serverTimestamp();
  await productsCollection.doc(id).create({
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return product;
};

const updateProduct = async (id, product) => {
  const { id: productId, ...data } = product;
  const reference = productsCollection.doc(id);
  const existing = await reference.get();

  if (!existing.exists) {
    return null;
  }

  const { createdAt } = existing.data();
  await reference.set(
    {
      ...data,
      createdAt: createdAt ?? admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: false },
  );

  return { ...product, id: productId };
};

const deleteProduct = async (id) => {
  const reference = productsCollection.doc(id);
  const existing = await reference.get();

  if (!existing.exists) {
    return false;
  }

  await reference.delete();
  return true;
};

module.exports = {
  getAllProducts,
  getProductById,
  getAllProductsForAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};