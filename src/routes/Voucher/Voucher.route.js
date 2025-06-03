const express = require("express");
const router = express.Router();
const VoucherController = require("../../controllers/Voucher.controller");
const auth = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");

// Public routes
router.get("/", VoucherController.getAllVouchers);
router.get("/:id", VoucherController.getVoucherById);

// Protected routes (require authentication)
router.use(auth);

// Public routes (authenticated)
router.get("/user/saved", VoucherController.getSavedVouchersForUser); // Lấy voucher đã lưu của user
router.post("/user/save/:voucherId", VoucherController.saveVoucherForUser); // Lưu voucher cho user
router.delete(
  "/user/delete-saved/:voucherId",
  VoucherController.deleteSavedVoucherForUser
); // Xóa voucher đã lưu của user

// Thêm route mới để kiểm tra tính áp dụng voucher cho sản phẩm
router.post(
  "/check-applicability",
  auth,
  VoucherController.checkVoucherApplicability
); // Yêu cầu xác thực người dùng

// Admin routes
router.post("/", checkPermission(["admin"]), VoucherController.createVoucher);
router.put("/:id", checkPermission(["admin"]), VoucherController.updateVoucher);
router.delete(
  "/:id",
  checkPermission(["admin"]),
  VoucherController.deleteVoucher
);

module.exports = router;
