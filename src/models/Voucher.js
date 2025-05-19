const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VoucherSchema = new Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalQuantity: { type: Number, required: true },
  usedQuantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  applicableCategories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  ],
  applicableProducts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ],
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  restrictions: {
    newUsersOnly: { type: Boolean, default: false },
    oneTimeUse: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Voucher", VoucherSchema, "Voucher");
