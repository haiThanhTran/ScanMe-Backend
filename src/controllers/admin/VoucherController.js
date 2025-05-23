const Voucher = require("../../models/Voucher/Voucher");
const Store = require("../../models/Store/Store");

// Lấy danh sách voucher, filter, phân trang
exports.getVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, storeId, search } = req.query;
    const filter = {};
    if (category) filter.applicableCategories = category;
    if (storeId) filter.storeId = storeId;
    if (search)
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    const vouchers = await Voucher.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("storeId", "name logo")
      .sort({ createdAt: -1 });
    const total = await Voucher.countDocuments(filter);
    res.json({ vouchers, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy chi tiết voucher
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate(
      "storeId",
      "name logo"
    );
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo voucher (admin/store)
exports.createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa voucher (admin/store)
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json({ message: "Voucher deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật voucher (admin/store)
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json(voucher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
