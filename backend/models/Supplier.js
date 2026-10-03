const { Schema, model } = require("mongoose");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const supplierSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required."],
      trim: true,
      minlength: [2, "Supplier name must be at least 2 characters."],
      maxlength: [80, "Supplier name cannot exceed 80 characters."],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || EMAIL_RE.test(v),
        message: (props) => `"${props.value}" is not a valid email address.`,
      },
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Note: `unique: true` on the `name` field above already builds a unique index.

module.exports = model("Supplier", supplierSchema);
