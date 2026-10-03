const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters."],
      maxlength: [60, "Category name cannot exceed 60 characters."],
      unique: true, // also builds a unique index — see note below
    },
    description: {
      type: String,
      trim: true,
      maxlength: [280, "Description cannot exceed 280 characters."],
      default: "",
    },
  },
  { timestamps: true }
);

// Note: `unique: true` on the `name` field above already builds a unique
// index — no separate `.index()` call needed (that would just duplicate it).

module.exports = model("Category", categorySchema);
