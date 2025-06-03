const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/OrderController"); // Controller cho Order
const auth = require("../../middleware/AuthMiddleware"); // Middleware xác thực

// Route để đặt hàng (yêu cầu xác thực người dùng)
router.post("/", auth, OrderController.placeOrder);

// Route để lấy lịch sử đơn hàng của người dùng hiện tại (yêu cầu xác thực)
router.get("/user/me", auth, OrderController.getOrdersByUserId);

// Route để lấy chi tiết đơn hàng theo ID (yêu cầu xác thực)
router.get("/:id", auth, OrderController.getOrderById);

module.exports = router;
