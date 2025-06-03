const Order = require('../../models/Orders/Order');
const Store = require('../../models/Store/Store');
const Voucher = require('../../models/Voucher/Voucher');
const Product = require('../../models/Product/Product');

const OrderService = {

    async getOrdersByStoreId(userId, page = 1, limit = 10) {
        const store = await Store.findOne({ userId: userId });
        if (!store) {
            throw new Error("Store not found");
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ storeId: store._id })
                .skip(skip)
                .limit(limit)
                .populate('userId')
                .populate('items.productId')
                .populate('appliedVouchers.voucherId'),
            Order.countDocuments({ storeId: store._id })
        ]);

        return {
            total,
            page,
            limit,
            orders
        };
    },
    async changeOrderStatus(id, status) {
        const validStatuses = ["pending", "confirmed", "cancelled"];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status");
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
            .populate('userId')
            .populate('items.productId')
            .populate('appliedVouchers.voucherId');

        if (!order) {
            throw new Error("Order not found");
        }

        return order;
    },


    async getOrderById(id) {
        return await Order.findById(id).populate('userId')
            .populate('items.productId')
            .populate('appliedVouchers.voucherId');
    },

};

module.exports = OrderService;