const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", asyncHandler(getAllCategories));
router.get("/:id", asyncHandler(getCategoryById));
router.post("/", asyncHandler(createCategory));
router.put("/:id", asyncHandler(updateCategory));
router.delete("/:id", asyncHandler(deleteCategory));

module.exports = router;
