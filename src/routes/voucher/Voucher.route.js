const express = require("express");
const router = express.Router();

const VoucherController = require("../controllers/voucher/VoucherController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

module.exports = router;
