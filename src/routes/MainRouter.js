const express = require("express");
const router = express.Router();
const authRouter = require("./auth/Auth.route");
const ProfileRoute = require("./user/Profile.route");
const adminRouter = require("./admin/Admin.route");
const systemRouter = require("./system/System.route");

const RegisterRouter = require("./register/Register.route");



router.use("/api/admin", adminRouter);
router.use("/api/auth", authRouter);
router.use("/api/user", ProfileRoute);
router.use("/api/system", systemRouter);
router.use("/api/register", RegisterRouter);

module.exports = router;
