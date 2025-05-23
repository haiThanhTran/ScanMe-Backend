const User = require("../../models/user/User");
const Store = require("../../models/Store/Store");

const StoreService = {
  async create(data) {
    const store = new Store(data);
    return await store.save();
  },
  async getAll() {
    return await Store.find({}).sort({ createdAt: -1 }).populate("userId");
  },
  async getById(id) {
    return await Store.findById(id).populate("userId");
  },
  async update(id, data) {
    return await Store.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return await Store.findByIdAndDelete(id);
  },
  async getStoreByUserId(id) {
    return await Store.findOne({ userId: id }).populate("userId");
  },
  async updateStoreByUserId(id, data) {

    const store = await Store.findOne({ userId: id }).populate("userId");
    if (!store) {
      throw new Error("Store not found11");
    }
    console.log("store", store._id);

    const updatedStore = await Store.findByIdAndUpdate(
      store._id,
      { ...data },
      { new: true }
    );
    return updatedStore;
  },
};

module.exports = StoreService;
