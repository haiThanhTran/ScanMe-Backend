const Voucher = require("../models/Voucher/Voucher");
const Product = require("../models/Product/Product"); // Import Product model
const Store = require("../models/Store/Store"); // Import Store model
const User = require("../models/User"); // Import User model
const mongoose = require("mongoose"); // Import mongoose for ObjectId

const VoucherService = {
  // Hàm kiểm tra tính áp dụng và giá trị giảm giá của voucher cho sản phẩm
  checkApplicability: async (voucherId, productId, productPrice, userId) => {
    try {
      // 1. Lấy thông tin voucher
      const voucher = await Voucher.findById(voucherId);
      if (
        !voucher ||
        !voucher.isActive ||
        new Date() > new Date(voucher.endDate)
      ) {
        throw new Error("Voucher không hợp lệ hoặc đã hết hạn");
      }

      // 2. Kiểm tra số lượng sử dụng
      if (voucher.usedQuantity >= voucher.totalQuantity) {
        throw new Error("Voucher đã hết lượt sử dụng");
      }

      // 3. Lấy thông tin sản phẩm (cần populate category và store)
      const product = await Product.findById(productId)
        .populate("storeId") // Populate store
        .populate("categories"); // Populate categories

      if (!product || !product.isActive) {
        throw new Error("Sản phẩm không hợp lệ hoặc không còn bán");
      }

      // 4. Kiểm tra theo Store (nếu voucher có storeId)
      if (voucher.storeId) {
        if (!product.storeId || !product.storeId.equals(voucher.storeId)) {
          throw new Error("Voucher không áp dụng cho cửa hàng này");
        }
      }

      // 5. Kiểm tra theo applicableProducts
      if (voucher.applicableProducts && voucher.applicableProducts.length > 0) {
        const isProductApplicable = voucher.applicableProducts.some((prodId) =>
          prodId.equals(productId)
        );
        if (!isProductApplicable) {
          throw new Error("Voucher không áp dụng cho sản phẩm này");
        }
      }

      // 6. Kiểm tra theo applicableCategories (chỉ kiểm tra nếu applicableProducts rỗng hoặc không tồn tại)
      // Logic: nếu không giới hạn theo sản phẩm cụ thể, thì kiểm tra theo danh mục.
      if (
        (!voucher.applicableProducts ||
          voucher.applicableProducts.length === 0) &&
        voucher.applicableCategories &&
        voucher.applicableCategories.length > 0
      ) {
        const isCategoryApplicable = voucher.applicableCategories.some(
          (catId) =>
            product.categories.some((productCat) => productCat.equals(catId))
        );
        if (!isCategoryApplicable) {
          throw new Error("Voucher không áp dụng cho danh mục sản phẩm này");
        }
      }

      // 7. Kiểm tra giá trị đơn hàng tối thiểu
      if (productPrice < voucher.minPurchaseAmount) {
        throw new Error(
          `Giá trị sản phẩm tối thiểu để áp dụng voucher là ${voucher.minPurchaseAmount.toLocaleString()}đ`
        );
      }

      // 8. Kiểm tra restriction một lần sử dụng/người dùng (cần thông tin user)
      if (voucher.restrictions && voucher.restrictions.oneTimeUse && userId) {
        const user = await User.findById(userId);
        if (!user) {
          // User not found - should not happen with authenticated route, but handle defensively
          throw new Error("Lỗi xác thực người dùng");
        }
        // Check if the user has already used this specific voucher
        const hasUserUsedVoucher =
          user.usedVouchers &&
          user.usedVouchers.some((usedVoucherId) =>
            usedVoucherId.equals(voucherId)
          );
        if (hasUserUsedVoucher) {
          throw new Error("Bạn đã sử dụng voucher này rồi");
        }
        // Note: The actual tracking of used vouchers per user will happen in the Place Order API
      }

      // 9. Tính giá trị giảm giá
      let discountAmount = 0;
      if (voucher.discountType === "percentage") {
        discountAmount = (productPrice * voucher.discountValue) / 100;
        // Áp dụng maxDiscountAmount nếu có
        if (
          voucher.maxDiscountAmount &&
          discountAmount > voucher.maxDiscountAmount
        ) {
          discountAmount = voucher.maxDiscountAmount;
        }
      } else if (voucher.discountType === "fixed") {
        discountAmount = voucher.discountValue;
        // Fixed amount should not exceed product price
        if (discountAmount > productPrice) {
          discountAmount = productPrice; // Cannot get more discount than price
        }
      }

      // Đảm bảo giá trị giảm giá là số dương và không vượt quá giá sản phẩm
      discountAmount = Math.max(0, Math.min(discountAmount, productPrice));

      // Trả về giá trị giảm giá
      return { discountAmount: discountAmount };
    } catch (error) {
      console.error("Error in checkApplicability:", error.message);
      // Ném lại lỗi để controller bắt và trả về cho frontend
      throw error;
    }
  },

  // Future functions for voucher logic (e.g., applyVoucherInOrder) would go here
};

module.exports = VoucherService;
