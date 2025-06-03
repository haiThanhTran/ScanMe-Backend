const Order = require('../../models/Orders/Order');
const Store = require('../../models/Store/Store');

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


    async getOrderById(id) {
        return await Order.findById(id).populate('userId')
            .populate('items.productId')
            .populate('appliedVouchers.voucherId');
    },

};

module.exports = OrderService;