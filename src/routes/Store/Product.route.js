const express = require("express");
const router = express.Router();
const ProductController = require("../../controllers/store/ProductController");
const auth = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");

// Protected routes (require authentication)
router.use(auth);

// Store routes
router.post("/", ProductController.createProduct);
router.get("/", ProductController.getProductsByStoreId);
router.get("/:id", ProductController.getProductsByStoreIdDetail);

router.delete("/:id", ProductController.deleteProductById);
router.patch("/:id", ProductController.updateProduct);



module.exports = router;
