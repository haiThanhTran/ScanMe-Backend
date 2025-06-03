const express = require("express");
const router = express.Router();
const VoucherController = require("../../controllers/store/VoucherController");
const auth = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");


// Protected routes (require authentication)
router.use(auth);

// Store routes
router.post(
    "/",
    VoucherController.createVoucher
);
router.get(
    "/",
    VoucherController.getVouchersByStoreId
);
router.get(
    "/:id",
    VoucherController.getVouchersByStoreIdDetail
);

router.delete(
    "/:id",
    VoucherController.deleteVoucherById
);
router.patch(
    "/:id",
    VoucherController.updateVoucher
);

module.exports = router;
