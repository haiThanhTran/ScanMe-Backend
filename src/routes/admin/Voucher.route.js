const express = require("express");
const router = express.Router();
const VoucherController = require("../../controllers/admin/VoucherController");
const AuthPermission = require("../../middleware/AuthPermission");

// Lấy danh sách voucher (filter, phân trang)
router.get("/", VoucherController.getVouchers);
// Lấy chi tiết voucher
router.get("/:id", VoucherController.getVoucherById);
// Tạo voucher (chỉ admin/store)
router.post(
  "/",
  AuthPermission.checkPermission(["admin", "store"]),
  VoucherController.createVoucher
);
// Xóa voucher (chỉ admin/store)
router.delete(
  "/:id",
  AuthPermission.checkPermission(["admin", "store"]),
  VoucherController.deleteVoucher
);
// Cập nhật voucher (chỉ admin/store)
router.put(
  "/:id",
  AuthPermission.checkPermission(["admin", "store"]),
  VoucherController.updateVoucher
);

module.exports = router;
