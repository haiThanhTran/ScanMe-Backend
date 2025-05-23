const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  paymentMethod: { type: String },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    zipCode: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema,"Order");
