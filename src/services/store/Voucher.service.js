const Voucher = require('../../models/Voucher/Voucher');
const Store = require('../../models/Store/Store');
const Product = require('../../models/Product/Product');
const Category = require('../../models/Category/Category');

const VoucherService = {
    async createVoucher(userId, data) {
        const store = await Store.findOne({ userId: userId });
        if (!store) {
            throw new Error("Store not found");
        }
        const newData = {
            ...data,
            isActive: true,
            storeId: store._id
        }
        const voucher = new Voucher(newData);
        return await voucher.save();
    },
    async getVouchersByStoreId(userId, page = 1, limit = 10) {
        const store = await Store.findOne({ userId: userId });
        if (!store) {
            throw new Error("Store not found");
        }
        const skip = (page - 1) * limit;
        const [vouchers, total] = await Promise.all([
            Voucher.find({ storeId: store._id })
                .skip(skip)
                .limit(limit)
                .populate('storeId').populate('applicableCategories')
                .populate('applicableProducts'),
            Voucher.countDocuments({ storeId: store._id })
        ]);
        return {
            total,
            page,
            limit,
            vouchers
        };
    }
    ,
    async getVoucherById(id) {
        return await Voucher.findById(id).populate('storeId');
    },
    async updateVoucher(id, data) {
        return await Voucher.findByIdAndUpdate(id, data, { new: true });
    }
    ,
    async deleteVoucherById(id) {
        return await Voucher.findByIdAndDelete(id);
    }
};

module.exports = VoucherService;