const OrderService = require('../../services/store/Order.service');

class OrderController {
    async getOrdersByUserId(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const orders = await OrderService.getOrdersByStoreId(req.account.userId, parseInt(page), parseInt(limit));
            res.status(200).json(orders);
        } catch (error) {
            console.error("Error in getOrdersByUserId:", error);
            res.status(500).json({ message: "Error fetching orders", error: error.message || error });
        }

    }
    async changeOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            console.log("Changing order status for ID:", id, "to status:", status);


            if (!status) {
                return res.status(400).json({ message: "Status is required" });
            }

            const updatedOrder = await OrderService.changeOrderStatus(id, status);
            res.status(200).json(updatedOrder);
        } catch (error) {
            console.error("Error in changeOrderStatus:", error);
            res.status(500).json({ message: "Error changing order status", error: error.message || error });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await OrderService.getOrderById(id);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: "Error fetching order by ID", error });
        }
    }
}

module.exports = new OrderController();