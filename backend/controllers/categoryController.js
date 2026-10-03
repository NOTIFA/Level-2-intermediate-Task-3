const mongoose = require("mongoose");
const Category = require("../models/Category");
const { ApiError } = require("../middleware/errorHandler");

exports.getAllCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.status(200).json({ success: true, data: categories });
};

exports.getCategoryById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, `Invalid id: "${req.params.id}".`);
  }

  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, `Category ${req.params.id} not found.`);

  res.status(200).json({ success: true, data: category });
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, data: category });
};

exports.updateCategory = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, `Invalid id: "${req.params.id}".`);
  }

  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, `Category ${req.params.id} not found.`);

  const { name, description } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;

  await category.save();
  res.status(200).json({ success: true, data: category });
};

exports.deleteCategory = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, `Invalid id: "${req.params.id}".`);
  }

  const Product = require("../models/Product");
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    throw new ApiError(409, "Cannot delete a category that still has products assigned to it.");
  }

  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, `Category ${req.params.id} not found.`);

  res.status(200).json({ success: true, message: `Category ${req.params.id} deleted.` });
};
