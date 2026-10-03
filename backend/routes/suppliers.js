const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

router.get("/", asyncHandler(getAllSuppliers));
router.get("/:id", asyncHandler(getSupplierById));
router.post("/", asyncHandler(createSupplier));
router.put("/:id", asyncHandler(updateSupplier));
router.delete("/:id", asyncHandler(deleteSupplier));

module.exports = router;
