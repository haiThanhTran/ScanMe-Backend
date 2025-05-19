const express = require("express");
const router = express.Router();
const authRouter = require("./auth/Auth.route");
const ProfileRoute = require("./user/Profile.route");
const adminRouter = require("./admin/Admin.route");
const systemRouter = require("./system/System.route");

const RegisterRouter = require("./register/Register.route");
const VoucherPublicRoute = require("./admin/Voucher.route");
const CategoryRoute = require("./Category.route");
const StoreRoute = require("./Store.route");

router.use("/api/admin", adminRouter);
router.use("/api/auth", authRouter);
router.use("/api/user", ProfileRoute);
router.use("/api/system", systemRouter);
router.use("/api/register", RegisterRouter);
router.use("/api/voucher", VoucherPublicRoute);
router.use("/api/category", CategoryRoute);
router.use("/api/store", StoreRoute);

module.exports = router;
