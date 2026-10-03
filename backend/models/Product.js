const { Schema, model } = require("mongoose");
const Category = require("./Category");
const Supplier = require("./Supplier");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters."],
      maxlength: [100, "Product name cannot exceed 100 characters."],
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      // Auto-generated in a pre-validate hook below when not supplied,
      // so existing clients that don't send a SKU still work.
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required."],
      min: [0, "Quantity cannot be negative."],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number.",
      },
    },
    // --- Relationships -------------------------------------------------
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required."],
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required."],
    },
  },
  { timestamps: true }
);

// ---------- Indexes (query + optimization) ----------

// Unique index on sku is declared via `unique: true` above. In addition:
// A text index powers fast, relevance-ranked name search (`?search=` queries)
// instead of a full collection scan with a regex.
productSchema.index({ name: "text" });

// A compound index supports the app's most common filtered listing:
// "products in category X, sorted/filtered by stock level" — e.g. a
// low-stock report scoped to one category. Mongo can use this index to
// satisfy both the equality match on `category` and the range/sort on
// `quantity` without a separate in-memory sort.
productSchema.index({ category: 1, quantity: 1 });

// ---------- Validation / normalization before saving ----------

productSchema.pre("validate", async function autoGenerateSku(next) {
  if (this.sku) return next();

  // Simple, readable SKU: first 3 letters of the name + a short random
  // suffix, e.g. "DES-4F2A1". Collisions are astronomically unlikely, but
  // the unique index still guards against them at the database level.
  const prefix = (this.name || "GEN").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "GEN";
  const suffix = Math.random().toString(16).slice(2, 7).toUpperCase();
  this.sku = `${prefix}-${suffix}`;
  next();
});

// Referential-integrity check: make sure `category` and `supplier` actually
// point at documents that exist before this product is allowed to save.
// Mongoose refs are not enforced by MongoDB itself, so this is done explicitly.
productSchema.pre("save", async function validateReferences(next) {
  if (this.isModified("category")) {
    const exists = await Category.exists({ _id: this.category });
    if (!exists) return next(new Error(`Category ${this.category} does not exist.`));
  }

  if (this.isModified("supplier")) {
    const exists = await Supplier.exists({ _id: this.supplier });
    if (!exists) return next(new Error(`Supplier ${this.supplier} does not exist.`));
  }

  next();
});

module.exports = model("Product", productSchema);
