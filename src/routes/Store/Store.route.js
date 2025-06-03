const express = require("express");
const router = express.Router();
const StoreController = require("../../controllers/store/StoreController");
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");

// Public: Lấy tất cả store
router.get("/",
  StoreController.getAll);
// User: Lấy store theo userId
router.get(
  "/store-by-userId",
  AuthMiddleware,
  StoreController.getStoreByUserId
);

// User: Cập nhật store theo userId
router.put(
  "/update/store-by-userId",
  AuthMiddleware,
  StoreController.updateStoreByUserId
);
// Public: Lấy store theo id
router.get("/:id", StoreController.getById);
// Admin: Tạo store
router.post(
  "/",
  AuthMiddleware,
  checkPermission(["ADMIN", "MANAGER_STORE"]),
  StoreController.create
);
// Admin: Sửa store
router.put(
  "/:id",
  AuthMiddleware,
  checkPermission(["ADMIN", "MANAGER_STORE"]),
  StoreController.update
);
// Admin: Xóa store
router.delete(
  "/:id",
  AuthMiddleware,
  checkPermission(["ADMIN", "MANAGER_STORE"]),
  StoreController.delete
);



module.exports = router;
