const Product = require('../../models/Product/Product');
const Store = require('../../models/Store/Store');
const Category = require('../../models/Category/Category');

const ProductService = {
    async createProduct(userId, data) {
        const store = await Store.findOne({ userId: userId });
        if (!store) {
            throw new Error("Store not found");
        }
        const newData = {
            ...data,
            isActive: true,
            storeId: store._id
        };
        const product = new Product(newData);
        return await product.save();
    },
    async getProductsByStoreId(userId, page = 1, limit = 10) {
        const store = await Store.findOne({ userId: userId });
        if (!store) {
            throw new Error("Store not found");
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find({ storeId: store._id })
                .skip(skip)
                .limit(limit)
                .populate('storeId')
                .populate('categories'),
            Product.countDocuments({ storeId: store._id })
        ]);

        return {
            total,
            page,
            limit,
            products
        };
    },

    async getById(id) {
        return await Product.findById(id).populate('storeId').populate('categories');
    },

    async updateProduct(id, data) {
        return await Product.findByIdAndUpdate(id, data, { new: true });
    },

    async deleteProductById(id) {
        return await Product.findByIdAndDelete(id);
    },


};

module.exports = ProductService;