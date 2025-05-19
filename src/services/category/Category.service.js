const Category = require("../../models/Category");

const CategoryService = {
  async create(data) {
    const category = new Category(data);
    return await category.save();
  },
  async getAll() {
    return await Category.find({ isActive: true }).sort({ createdAt: -1 });
  },
  async getById(id) {
    return await Category.findById(id);
  },
  async update(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return await Category.findByIdAndDelete(id);
  },
};

module.exports = CategoryService;
