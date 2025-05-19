const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VoucherCampaignSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  voucherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Voucher" }],
  target: {
    userGroups: [{ type: String }],
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  rules: {
    assignmentMethod: {
      type: String,
      enum: ["automatic", "manual", "code_redemption"],
      default: "manual",
    },
    maxVouchersPerUser: { type: Number, default: 1 },
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled"],
    default: "draft",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VoucherCampaign", VoucherCampaignSchema,"VoucherCampaign");
