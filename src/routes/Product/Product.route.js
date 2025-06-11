const express = require("express");
const router = express.Router();
const ProductController = require("../../controllers/Product.controller");
const auth = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");

// Public routes
router.get("/", ProductController.getAllProducts);
router.get("/flash-sale", ProductController.getFlashSaleProducts);
router.get("/:id", ProductController.getProductById);
router.get("/store/:storeId", ProductController.getProductsByStore);
router.get("/category/:categoryId", ProductController.getProductsByCategory);
// Protected routes (require authentication)
router.use(auth);

// Admin and Store routes
router.post(
  "/",
  checkPermission(["admin", "store"]),
  ProductController.createProduct
);
router.put(
  "/:id",
  checkPermission(["admin", "store"]),
  ProductController.updateProduct
);
router.delete(
  "/:id",
  checkPermission(["admin", "store"]),
  ProductController.deleteProduct
);

module.exports = router;
