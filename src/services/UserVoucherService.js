// src/services/UserVoucherService.js
const User = require("../models/user/User"); // Đảm bảo đường dẫn đúng
const Voucher = require("../models/Voucher/Voucher"); // Đảm bảo đường dẫn đúng
const mongoose = require("mongoose"); // Thêm mongoose nếu chưa có

const UserVoucherService = {
  saveVoucher: async (userId, voucherId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      const voucher = await Voucher.findById(voucherId);
      if (!voucher) {
        return { success: false, message: "Voucher not found" };
      }

      // Kiểm tra xem voucher có còn lượt sử dụng không (từ voucher gốc)
      if (voucher.totalQuantity > 0 && (voucher.usedQuantity || 0) >= voucher.totalQuantity) {
        return { success: false, message: "Voucher này đã hết lượt lưu." };
      }

      // Kiểm tra xem người dùng đã lưu voucher này VÀ nó CHƯA được sử dụng hay không
      const existingUnusedSavedVoucher = user.vouchers.find(
        (savedVoucher) =>
          savedVoucher.voucherId &&
          savedVoucher.voucherId.toString() === voucherId &&
          savedVoucher.isUsed === false // Chỉ kiểm tra những voucher CHƯA DÙNG
      );

      if (existingUnusedSavedVoucher) {
        return { success: false, message: "Bạn đã lưu voucher này và chưa sử dụng." };
      }

      // Nếu không có bản ghi "chưa sử dụng" nào, cho phép lưu mới
      user.vouchers.push({
        voucherId: new mongoose.Types.ObjectId(voucherId), // Đảm bảo lưu ObjectId
        isUsed: false, // Mặc định là chưa sử dụng
        acquiredAt: new Date(),
        // expiresAt: voucher.endDate, // Bạn có thể muốn lưu ngày hết hạn của voucher gốc tại thời điểm lưu
                                    // để nếu voucher gốc thay đổi endDate, bản sao của user vẫn giữ endDate cũ.
                                    // Hoặc không lưu, và luôn lấy endDate từ voucher gốc khi getSavedVouchers.
                                    // Hiện tại getSavedVouchers đang lấy từ voucher gốc.
      });

      await user.save();
      return { success: true, message: "Voucher đã được lưu thành công!" };

    } catch (error) {
      console.error("Error saving voucher for user:", error);
      // Phân biệt lỗi do người dùng hay do server
      if (error.message.includes("User not found") || error.message.includes("Voucher not found")) {
        return { success: false, message: error.message };
      }
      throw new Error("Lỗi hệ thống khi lưu voucher."); // Lỗi không mong muốn
    }
  },

  getSavedVouchers: async (userId) => {
    try {
      const user = await User.findById(userId).populate({
        path: 'vouchers.voucherId', // Populate thông tin chi tiết của voucher gốc
        model: 'Voucher', // Tên model Voucher
        populate: { // Populate thêm storeId từ Voucher nếu cần hiển thị tên cửa hàng
            path: 'storeId',
            model: 'Store',
            select: 'name logo'
        }
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      const savedVouchers = user.vouchers
        .filter(savedVoucher => savedVoucher.voucherId != null) // Loại bỏ những cái populate không thành công
        .map(savedVoucher => {
          // Kết hợp thông tin từ voucher gốc và thông tin từ bản ghi trong user.vouchers
          const voucherDetails = savedVoucher.voucherId.toObject ? savedVoucher.voucherId.toObject() : savedVoucher.voucherId;
          return {
            ...voucherDetails, // Tất cả các trường của voucher gốc
            _id: savedVoucher.voucherId._id, // Quan trọng: _id này là của voucher gốc
            savedVoucherId: savedVoucher._id, // _id của bản ghi trong mảng user.vouchers (để xóa)
            isUsed: savedVoucher.isUsed,
            acquiredAt: savedVoucher.acquiredAt,
            // Bạn có thể thêm expiresAt ở đây nếu đã lưu nó khi push vào user.vouchers
            // expiresAt: savedVoucher.expiresAt || voucherDetails.endDate,
          };
        })
        .sort((a,b) => new Date(b.acquiredAt) - new Date(a.acquiredAt)); // Sắp xếp mới nhất lên đầu

      return { success: true, data: savedVouchers };
    } catch (error) {
      console.error("Error getting saved vouchers:", error);
      throw new Error("Failed to get saved vouchers");
    }
  },

  deleteSavedVoucher: async (userId, savedVoucherInstanceId) => { // Đổi tên tham số thành ID của bản ghi trong mảng vouchers
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Xóa dựa trên _id của sub-document trong mảng user.vouchers
      const updateResult = await User.updateOne(
        { _id: userId },
        { $pull: { vouchers: { _id: new mongoose.Types.ObjectId(savedVoucherInstanceId) } } }
      );

      if (updateResult.modifiedCount === 0) {
        return {
          success: false,
          message: "Voucher không tìm thấy trong danh sách đã lưu hoặc đã được xóa.",
        };
      }

      return { success: true, message: "Voucher đã được xóa khỏi ví." };
    } catch (error) {
      console.error("Error deleting saved voucher:", error);
      throw new Error("Failed to delete saved voucher");
    }
  },
};

module.exports = UserVoucherService;