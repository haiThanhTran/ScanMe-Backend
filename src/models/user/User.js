const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationToken: { type: String, required: false },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: false,
    },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, default: null },
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    phone: { type: String, default: null },
    city: { type: String, default: null },
    country: { type: String, default: "Việt Nam" },
    address: { type: String, default: "" },
    status: { type: String, default: "active" },
    role: { type: String, default: "customer" },
    vouchers: [
      {
        voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
        isUsed: { type: Boolean, default: false },
        acquiredAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
      },
    ],
    avatar: { type: String, default: "" }, // Ảnh đại diện
    dateOfBirth: { type: Date, default: null }, // Ngày sinh
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    }, // Giới tính
    verified: { type: Boolean, default: false }, // Xác minh tài khoản
    lastLogin: { type: Date, default: null }, // Lần đăng nhập gần nhất
    isBlocked: { type: Boolean, default: null }, // Trạng thái khóa tài khoản
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deleteAt: { type: Date, default: null },
  },
  { collection: "User" }
);

module.exports = mongoose.model("User", User, "User");
