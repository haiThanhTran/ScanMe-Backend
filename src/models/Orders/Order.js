// src/models/Orders/Order.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho từng item trong đơn hàng
const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true }, // Lưu lại tên SP tại thời điểm đặt hàng
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true }, // Giá gốc của sản phẩm tại thời điểm đặt hàng
  originalSubTotal: {type: Number, required: true}, // quantity * unitPrice
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
}, {_id: false}); // Không cần _id riêng cho mỗi OrderItem nếu không có nhu cầu đặc biệt

// Schema chính cho Đơn hàng
const OrderSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderCode: { type: String, unique: true, sparse: true }, // Mã đơn hàng tự tăng hoặc logic riêng
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }, // <<--- STORE ID Ở CẤP ĐƠN HÀNG
  items: [OrderItemSchema], // Mảng các sản phẩm thuộc đơn hàng này (cùng storeId)
  shippingInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },    // Tùy chọn
    zipCode: { type: String }, // Tùy chọn
  },
  // Các trường tính toán tổng hợp cho đơn hàng này (của store này)
  subTotal: { type: Number, required: true },      // Tổng tiền hàng gốc của các items trong đơn này
  totalDiscount: { type: Number, default: 0 },  // Tổng tiền giảm giá từ voucher cho các items trong đơn này
  shippingFee: { type: Number, default: 0 },     // Phí vận chuyển cho đơn này (nếu có)
  totalAmount: { type: Number, required: true },   // Số tiền cuối cùng khách phải trả cho đơn này
  status: {
    type: String,
    enum: ["pending", "processing", "confirmed", "delivering", "completed", "cancelled", "failed"],
    default: "pending",
  },
  paymentMethod: { type: String, default: "COD" },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  notes: { type: String }, // Ghi chú của khách hàng cho đơn hàng này
  cancellationReason: {type: String}, // Lý do hủy (nếu có)
  // Không cần mảng appliedVouchers ở cấp độ này nữa
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook để tạo orderCode nếu chưa có
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderCode) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Tạo một chuỗi ngẫu nhiên để tăng tính duy nhất khi tách đơn
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    // Đếm số đơn hàng trong ngày để tạo sequence (có thể cần tối ưu cho performance cao)
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
    }).session(this.$session()); // QUAN TRỌNG: sử dụng session hiện tại nếu có
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.orderCode = `HD${year}${month}${day}${sequence}-${randomSuffix}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", OrderSchema, "Order");