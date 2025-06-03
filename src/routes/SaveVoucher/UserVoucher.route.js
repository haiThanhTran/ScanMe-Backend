const express = require("express");
const router = express.Router();
const UserVoucherController = require("../../controllers/UserVoucherController");
const auth = require("../../middleware/AuthMiddleware");

// Apply auth middleware to all user voucher routes
router.use(auth);

// POST /api/user/vouchers - Save a voucher for the authenticated user
router.post("/vouchers", UserVoucherController.saveVoucher);

// GET /api/user/vouchers - Get all saved vouchers for the authenticated user
router.get("/vouchers", UserVoucherController.getSavedVouchers);

// DELETE /api/user/vouchers/:voucherId - Delete a saved voucher for the authenticated user
router.delete("/vouchers/:voucherId", UserVoucherController.deleteSavedVoucher);

module.exports = router;
