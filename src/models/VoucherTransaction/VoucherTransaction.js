const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VoucherTransactionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
    required: true,
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  transactionType: {
    type: String,
    enum: ["acquired", "used", "expired"],
    required: true,
  },
  discountAmount: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VoucherTransaction", VoucherTransactionSchema,"VoucherCampaign");
