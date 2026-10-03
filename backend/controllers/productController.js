const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const { ApiError } = require("../middleware/errorHandler");

function assertValidObjectId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}: "${id}".`);
  }
}

// The original frontend only ever sends { name, price, quantity } — no
// category/supplier. Rather than break that contract, we resolve sensible
// defaults ("Uncategorized" / "Unknown Supplier") the first time they're
// needed, using findOneAndUpdate with upsert so concurrent requests can't
// create duplicates of the same default document.
async function resolveDefaultCategory() {
  return Category.findOneAndUpdate(
    { name: "Uncategorized" },
    { $setOnInsert: { name: "Uncategorized", description: "Auto-assigned when no category is given." } },
    { new: true, upsert: true }
  );
}

async function resolveDefaultSupplier() {
  return Supplier.findOneAndUpdate(
    { name: "Unknown Supplier" },
    { $setOnInsert: { name: "Unknown Supplier" } },
    { new: true, upsert: true }
  );
}

async function resolveCategoryId(rawId) {
  if (!rawId) return (await resolveDefaultCategory())._id;
  assertValidObjectId(rawId, "categoryId");
  const category = await Category.findById(rawId);
  if (!category) throw new ApiError(404, `Category ${rawId} not found.`);
  return category._id;
}

async function resolveSupplierId(rawId) {
  if (!rawId) return (await resolveDefaultSupplier())._id;
  assertValidObjectId(rawId, "supplierId");
  const supplier = await Supplier.findById(rawId);
  if (!supplier) throw new ApiError(404, `Supplier ${rawId} not found.`);
  return supplier._id;
}

// GET /api/products
// Supports: ?search=text (uses the text index), ?category=<id>,
// ?page & ?limit (pagination, capped at 100 per page).
exports.getAllProducts = async (req, res) => {
  const { search, category } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) {
    assertValidObjectId(category, "category");
    filter.category = category;
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(), // .lean() skips hydrating full Mongoose documents — faster for read-only lists
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  assertValidObjectId(req.params.id);

  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("supplier", "name email");

  if (!product) throw new ApiError(404, `Product with id ${req.params.id} not found.`);

  res.status(200).json({ success: true, data: product });
};

// POST /api/products
exports.createProduct = async (req, res) => {
  const { name, price, quantity, categoryId, supplierId } = req.body;

  const [category, supplier] = await Promise.all([
    resolveCategoryId(categoryId),
    resolveSupplierId(supplierId),
  ]);

  // Mongoose schema validators (required/min/integer) run on .save() and
  // surface as a ValidationError, translated to a 400 by the error handler.
  const product = await Product.create({ name, price, quantity, category, supplier });
  await product.populate([{ path: "category", select: "name" }, { path: "supplier", select: "name email" }]);

  res.status(201).json({ success: true, data: product });
};

// PUT /api/products/:id (partial update)
exports.updateProduct = async (req, res) => {
  assertValidObjectId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, `Product with id ${req.params.id} not found.`);

  const { name, price, quantity, categoryId, supplierId } = req.body;

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (quantity !== undefined) product.quantity = quantity;
  if (categoryId !== undefined) product.category = await resolveCategoryId(categoryId);
  if (supplierId !== undefined) product.supplier = await resolveSupplierId(supplierId);

  // .save() (rather than findByIdAndUpdate) so the pre("save") reference
  // check and schema validators both run on updates too, not just creates.
  await product.save();
  await product.populate([{ path: "category", select: "name" }, { path: "supplier", select: "name email" }]);

  res.status(200).json({ success: true, data: product });
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  assertValidObjectId(req.params.id);

  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, `Product with id ${req.params.id} not found.`);

  res.status(200).json({ success: true, message: `Product ${req.params.id} deleted.` });
};
