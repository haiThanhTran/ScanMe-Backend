const StoreService = require("../../services/store/Store.service");

exports.create = async (req, res) => {
  try {
    const store = await StoreService.create(req.body);
    res.status(201).json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const stores = await StoreService.getAll();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const store = await StoreService.getById(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const store = await StoreService.update(req.params.id, req.body);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const store = await StoreService.delete(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json({ message: "Store deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
