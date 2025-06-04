// src/controllers/OrderController.js
const OrderService = require("../services/OrderService");

const OrderController = {
  placeOrder: async (req, res) => {
    console.log("[OrderController.placeOrder] req.user:", req.user);
    try {
      const userId = req.user.id;
      // Lấy thêm shippingInfo và totalAmount từ req.body
      const { items, shippingInfo, totalAmount } = req.body;

      if (!items || !shippingInfo || totalAmount === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin đơn hàng." });
      }

      const orderResult = await OrderService.placeOrder(
        userId,
        items,
        shippingInfo,
        totalAmount
      );

      res.status(201).json({ success: true, data: orderResult });
    } catch (error) {
      console.error("Error in OrderController.placeOrder:", error.message);
      // Trả về message lỗi từ service để frontend có thể hiển thị
      res.status(400).json({ success: false, message: error.message });
    }
  },
  // ... các hàm khác giữ nguyên
  getOrdersByUserId: async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await OrderService.getOrdersByUserId(userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error(
        "Error in OrderController.getOrdersByUserId:",
        error.message
      );
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const order = await OrderService.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or you don't have permission to view it",
        });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      console.error("Error in OrderController.getOrderById:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateOrderStatusByUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const { orderId, newStatus, cancellationReason } = req.body;
      if (!orderId || !newStatus) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin." });
      }
      const updatedOrder = await OrderService.updateOrderStatusByUser(
        orderId,
        userId,
        newStatus,
        cancellationReason
      );
      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = OrderController;
