const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/store/OrderController");
const auth = require("../../middleware/AuthMiddleware");
const { checkPermission } = require("../../middleware/AuthPermission");


// Protected routes (require authentication)
router.use(auth);

// Store routes
router.get(
    "/",
    OrderController.getOrdersByUserId
);
router.get(
    "/:id",
    OrderController.getOrderById
);

module.exports = router;
