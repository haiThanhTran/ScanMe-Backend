// src/models/Orders/Order.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho từng item trong đơn hàng
const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true }, // Lưu lại tên SP tại thời điểm đặt hàng
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true }, // Giá gốc của sản phẩm tại thời điểm đặt hàng
  originalSubTotal: { type: Number, required: true }, // quantity * unitPrice
  discountApplied: { type: Number, default: 0 }, // Số tiền giảm giá cụ thể cho item này từ voucher (nếu có)
  finalSubTotal: { type: Number, required: true }, // originalSubTotal - discountApplied

  // Thông tin voucher đã áp dụng cho item này (nếu có)
  appliedVoucherInfo: {
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" }, // ID của Voucher gốc
    code: { type: String }, // Mã của voucher gốc
    discountType: { type: String, enum: ["percentage", "fixed"] },
    discountValue: { type: Number }, // Giá trị gốc của voucher (ví dụ 10% hoặc 20000)
    calculatedDiscountForItem: { type: Number } // Số tiền thực tế được giảm cho item này từ voucher này
  },
  // storeId của sản phẩm này không cần thiết ở đây nữa vì OrderSchema đã có storeId
}, { _id: false }); // Không cần _id riêng cho mỗi OrderItem nếu không có nhu cầu đặc biệt

// Schema chính cho Đơn hàng
const OrderSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String },
      quantity: { type: Number },
      unitPrice: { type: Number },
      subTotal: { type: Number },
    },
  ],
  appliedVouchers: [
    {
      voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
      code: { type: String },
      discountAmount: { type: Number },
    },
  ],
  subTotal: { type: Number },
  totalDiscount: { type: Number },
  totalAmount: { type: Number },
  status: {
    type: String,
    enum: ["pending", , "confirmed", "cancelled"],
    default: "pending",
  },
  paymentMethod: { type: String, default: "COD" },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  notes: { type: String }, // Ghi chú của khách hàng cho đơn hàng này
  cancellationReason: { type: String }, // Lý do hủy (nếu có)
  // Không cần mảng appliedVouchers ở cấp độ này nữa
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema, "Order");
