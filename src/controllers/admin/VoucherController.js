// src/controllers/admin/VoucherController.js (hoặc đường dẫn tương tự)
const Voucher = require("../../models/Voucher/Voucher");
const mongoose = require("mongoose"); // Import mongoose để dùng mongoose.Types.ObjectId

// Lấy danh sách voucher, filter, phân trang
exports.getVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, storeId, search, isActive, sort = 'createdAt_desc' } = req.query; // Thêm isActive, sort
    const filter = {};

    // Xử lý filter theo category (có thể là một hoặc nhiều category)
    if (category) {
      const categoryIds = category.split(',').map(id => {
        if (mongoose.Types.ObjectId.isValid(id.trim())) {
          return new mongoose.Types.ObjectId(id.trim());
        }
        return null; // Hoặc throw error nếu ID không hợp lệ
      }).filter(id => id !== null); // Loại bỏ các ID không hợp lệ

      if (categoryIds.length > 0) {
        filter.applicableCategories = { $in: categoryIds }; // Tìm voucher có applicableCategories chứa BẤT KỲ ID nào trong mảng
      } else if (category) { // Nếu category được truyền nhưng không có ID hợp lệ nào
        console.warn("Invalid category IDs provided:", category);
        // Trả về rỗng nếu không có category ID hợp lệ nào được tìm thấy
        return res.json({ vouchers: [], total: 0, pagination: { page: 1, limit: Number(limit), totalPages: 0, totalRecords: 0 } });
      }
    }

    // Xử lý filter theo storeId (có thể là một hoặc nhiều storeId)
    if (storeId) {
      const storeIds = storeId.split(',').map(id => {
        if (mongoose.Types.ObjectId.isValid(id.trim())) {
          return new mongoose.Types.ObjectId(id.trim());
        }
        return null;
      }).filter(id => id !== null);

      if (storeIds.length > 0) {
        filter.storeId = { $in: storeIds }; // Tìm voucher có storeId nằm trong mảng storeIds
      } else if (storeId) {
        console.warn("Invalid store IDs provided:", storeId);
        return res.json({ vouchers: [], total: 0, pagination: { page: 1, limit: Number(limit), totalPages: 0, totalRecords: 0 } });
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { code: searchRegex },
        { description: searchRegex },
        // Bạn có thể thêm tìm kiếm theo tên cửa hàng nếu populate và $lookup (phức tạp hơn)
        // Hoặc nếu bạn lưu tên cửa hàng trực tiếp vào voucher (không khuyến khích vì dư thừa)
      ];
    }

    // Xử lý filter theo isActive
    if (isActive !== undefined && isActive !== null && isActive !== 'all') { // Thêm điều kiện kiểm tra isActive
        filter.isActive = isActive === 'true'; // Chuyển string 'true'/'false' thành boolean
    }

    // Xử lý sắp xếp
    let sortOption = { createdAt: -1 }; // Mặc định mới nhất
    if (sort) {
        const parts = sort.split('_'); // ví dụ: "endDate_asc", "discountValue_desc"
        if (parts.length === 2) {
            sortOption = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
        }
    }


    const count = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .populate("storeId", "name logo") // Giữ lại populate
      .populate("applicableCategories", "name") // Populate thêm category để có thể hiển thị tên
      .sort(sortOption) // Áp dụng sắp xếp
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      vouchers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
        totalRecords: count,
      },
      success: true // Thêm success flag
    });
  } catch (err) {
    console.error("Error in getVouchers:", err); // Log lỗi chi tiết hơn ở server
    // Trả về lỗi cụ thể hơn nếu là lỗi cast ObjectId
    if (err.name === 'CastError' && err.path && (err.path === 'applicableCategories' || err.path === 'storeId')) {
        return res.status(400).json({ success: false, error: `ID không hợp lệ cho trường ${err.path}` });
    }
    res.status(500).json({ success: false, error: "Lỗi máy chủ: " + err.message });
  }
};

// ... (các hàm getVoucherById, createVoucher, deleteVoucher, updateVoucher giữ nguyên) ...
// Lấy chi tiết voucher
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate(
      "storeId",
      "name logo"
    ).populate("applicableCategories", "name");
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json({data: voucher, success: true});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo voucher (admin/store)
exports.createVoucher = async (req, res) => {
  try {
    const voucherData = req.body;
    // Đảm bảo applicableCategories và applicableProducts là mảng các ObjectId hợp lệ nếu được gửi
    if (voucherData.applicableCategories && !Array.isArray(voucherData.applicableCategories)) {
        voucherData.applicableCategories = voucherData.applicableCategories.split(',').map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
    }
    if (voucherData.applicableProducts && !Array.isArray(voucherData.applicableProducts)) {
        voucherData.applicableProducts = voucherData.applicableProducts.split(',').map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
    }

    const voucher = new Voucher(voucherData);
    await voucher.save();
    res.status(201).json({data: voucher, success: true});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa voucher (admin/store)
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json({ message: "Voucher deleted", success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật voucher (admin/store)
exports.updateVoucher = async (req, res) => {
  try {
    const voucherData = req.body;
    // Tương tự như create, đảm bảo mảng ObjectId hợp lệ
    if (voucherData.applicableCategories && !Array.isArray(voucherData.applicableCategories) && typeof voucherData.applicableCategories === 'string') {
        voucherData.applicableCategories = voucherData.applicableCategories.split(',').map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
    }
    if (voucherData.applicableProducts && !Array.isArray(voucherData.applicableProducts) && typeof voucherData.applicableProducts === 'string') {
        voucherData.applicableProducts = voucherData.applicableProducts.split(',').map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
    }

    const voucher = await Voucher.findByIdAndUpdate(req.params.id, voucherData, {
      new: true,
      runValidators: true // Chạy validators của schema khi update
    }).populate("storeId", "name logo").populate("applicableCategories", "name");

    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json({data: voucher, success: true});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};