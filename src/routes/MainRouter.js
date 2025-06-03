const express = require("express");
const router = express.Router();
const authRouter = require("./auth/Auth.route");
const ProfileRoute = require("./user/Profile.route");
const adminRouter = require("./admin/Admin.route");
const systemRouter = require("./system/System.route");

const RegisterRouter = require("./register/Register.route");
const VoucherPublicRoute = require("./admin/Voucher.route");
const CategoryRoute = require("./Category/Category.route");
const StoreRoute = require("./Store/Store.route");
const productRoute = require("./Product/Product.route")
const ProductStoreRoute = require("./Store/Product.route");
const VoucherStoreRoute = require("./Store/Voucher.route");
const uploadRouter = require("./cloudinary-upload");
const OrderStoreRoute = require("./Store/Order.route");

router.use("/api/admin", adminRouter);
router.use("/api/auth", authRouter);
router.use("/api/user", ProfileRoute);
router.use("/api/system", systemRouter);
router.use("/api/register", RegisterRouter);
router.use("/api/voucher", VoucherPublicRoute);
router.use("/api/categories", CategoryRoute);
router.use("/api/stores", StoreRoute);
router.use("/api/products", productRoute);
router.use("/api/products-store", ProductStoreRoute);
router.use("/api/voucher-store", VoucherStoreRoute);
router.use("/api/order-store", OrderStoreRoute);
router.use('/api', uploadRouter)

module.exports = router;
