const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", asyncHandler(getAllProducts));
router.get("/:id", asyncHandler(getProductById));
router.post("/", asyncHandler(createProduct));
router.put("/:id", asyncHandler(updateProduct));
router.delete("/:id", asyncHandler(deleteProduct));

module.exports = router;
