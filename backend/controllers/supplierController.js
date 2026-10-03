const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");
const { ApiError } = require("../middleware/errorHandler");

exports.getAllSuppliers = async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 }).lean();
  res.status(200).json({ success: true, data: suppliers });
};

exports.getSupplierById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, `Invalid id: "${req.params.id}".`);
  }

  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, `Supplier ${req.params.id} not found.`);

  res.status(200).json({ success: true, data: supplier });
};

exports.createSupplier = async (req, res) => {
  const { name, email, phone } = req.body;
  const supplier = await Supplier.create({ name, email, phone });
  res.status(201).json({ success: true, data: supplier });
};

exports.updateSupplier = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, `Invalid id: "${req.params.id}".`);
  }

  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, `Supplier ${req.params.id} not found.`);

  const { name, email, phone } = req.body;
  if (name !== undefined) supplier.name = name;
  if (email !== undefined) supplier.email = email;
  if (phone !== undefined) supplier.phone = phone;

  await supplier.save();
  res.status(200).json({ success: true, data: supplier });
};

exports.deleteSupplier = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, `Invalid id: "${req.params.id}".`);
  }

  const Product = require("../models/Product");
  const inUse = await Product.exists({ supplier: req.params.id });
  if (inUse) {
    throw new ApiError(409, "Cannot delete a supplier that still has products assigned to it.");
  }

  const deleted = await Supplier.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, `Supplier ${req.params.id} not found.`);

  res.status(200).json({ success: true, message: `Supplier ${req.params.id} deleted.` });
};
