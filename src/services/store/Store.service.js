const Store = require("../../models/Store");

const StoreService = {
  async create(data) {
    const store = new Store(data);
    return await store.save();
  },
  async getAll() {
    return await Store.find({}).sort({ createdAt: -1 });
  },
  async getById(id) {
    return await Store.findById(id);
  },
  async update(id, data) {
    return await Store.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return await Store.findByIdAndDelete(id);
  },
};

module.exports = StoreService;
