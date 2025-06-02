const express = require("express");
const router = express.Router();
const ProfileController = require("../../controllers/user/Profile.controller");
const authMiddleware = require("../../middleware/AuthMiddleware"); // Đảm bảo có middleware xác thực

router.get("/cart", authMiddleware, ProfileController.getCart);
router.post("/cart", authMiddleware, ProfileController.updateCart);
router.delete(
  "/cart/:productId",
  authMiddleware,
  ProfileController.removeFromCart
);
router.put("/cart", authMiddleware, ProfileController.updateCart);
router.delete('/clear', authMiddleware, ProfileController.clearCart); // THÊM ROUTE NÀY
module.exports = router;
