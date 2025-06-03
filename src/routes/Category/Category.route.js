const express = require("express");
const router = express.Router();
const CategoryController = require("../../controllers/category/CategoryController");
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");

// Public: Lấy tất cả category
router.get("/", CategoryController.getAll);
// Public: Lấy category theo id
router.get("/:id", CategoryController.getById);
// Admin: Tạo category
router.post(
  "/",
  AuthMiddleware,
  checkPermission(["ADMIN", "MANAGER_CATEGORY"]),
  CategoryController.create
);
// Admin: Sửa category
router.put(
  "/:id",
  AuthMiddleware,
  checkPermission(["ADMIN", "MANAGER_CATEGORY"]),
  CategoryController.update
);
// Admin: Xóa category
router.delete(
  "/:id",
  AuthMiddleware,
  checkPermission(["ADMIN", "MANAGER_CATEGORY"]),
  CategoryController.delete
);

module.exports = router;
