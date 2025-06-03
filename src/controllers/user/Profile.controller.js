// src/controllers/user/Profile.controller.js
const User = require("../../models/user/User");
const mongoose = require("mongoose");

class ProfileController {
  async getCurrentUserProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.warn("[getCurrentUserProfile] User ID not found in req.user");
        return res.status(401).json({ message: "Xác thực thất bại hoặc token không hợp lệ." });
      }

      const user = await User.findById(userId).select(
        "-password -verificationToken -vouchers._id -cart._id -__v"
      );
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      res.status(200).json(user);
        } catch (error) {
      console.error("Error fetching current user profile:", error);
      res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin người dùng." });
        }
    }

    async getProfileById(req, res) {
        try {
            const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID người dùng không hợp lệ." });
      }
      const user = await User.findById(id).select(
        "-password -verificationToken -vouchers._id -cart._id -__v"
      );

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user profile by ID:", error);
      res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin người dùng theo ID." });
    }
  }

  async updateCurrentUserProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.warn("[updateCurrentUserProfile] User ID not found in req.user");
        return res.status(401).json({ message: "Xác thực thất bại hoặc token không hợp lệ." });
      }

      const { phone, address, avatar, dateOfBirth, gender, firstName, lastName, fullName } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }

      let hasChanges = false;

      if (phone !== undefined && phone.trim() !== (user.phone || "")) { user.phone = phone.trim(); hasChanges = true; }
      if (address !== undefined && address.trim() !== (user.address || "")) { user.address = address.trim(); hasChanges = true; }
      if (avatar !== undefined && avatar !== user.avatar) { user.avatar = avatar; hasChanges = true; } // Avatar có thể không cần trim
      if (dateOfBirth !== undefined ) {
        const newDob = dateOfBirth ? new Date(dateOfBirth).toISOString() : null;
        const currentDob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString() : null;
        if (newDob !== currentDob) {
            user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
            hasChanges = true;
        }
      }
      if (gender !== undefined && gender !== user.gender) { user.gender = gender; hasChanges = true; }

      const trimmedFirstName = (firstName || "").trim();
      const trimmedLastName = (lastName || "").trim();

      if (firstName !== undefined && trimmedFirstName !== (user.first_name || "")) {
        user.first_name = trimmedFirstName;
        hasChanges = true;
      }
      if (lastName !== undefined && trimmedLastName !== (user.last_name || "")) {
        user.last_name = trimmedLastName;
        hasChanges = true;
      }
      
      // Xử lý fullName:
      // 1. Nếu client gửi fullName, ưu tiên nó.
      // 2. Nếu không, tự động ghép từ first_name và last_name (nếu chúng thay đổi hoặc fullName cũ không khớp)
      let newConstructedFullName = "";
      if (user.first_name || user.last_name) { // Chỉ ghép nếu có first hoặc last name
        newConstructedFullName = `${user.last_name || ""} ${user.first_name || ""}`.trim();
      }

      if (fullName !== undefined && fullName.trim() !== (user.fullName || "")) {
        user.fullName = fullName.trim();
        hasChanges = true;
      } else if ( (firstName !== undefined || lastName !== undefined) && // Nếu first/last name có thay đổi được gửi lên
                  newConstructedFullName && // và fullName ghép lại có giá trị
                  newConstructedFullName !== (user.fullName || "") // và nó khác với fullName hiện tại
                ) {
        user.fullName = newConstructedFullName;
        hasChanges = true;
      }


      if (!hasChanges) {
        const userObjectNoChange = user.toObject();
        delete userObjectNoChange.password; delete userObjectNoChange.verificationToken; delete userObjectNoChange.__v;
        return res.status(200).json({ success: true, message: "Không có thông tin nào được thay đổi.", user: userObjectNoChange });
      }

      user.updatedAt = Date.now();
      const updatedUser = await user.save();

      const userObject = updatedUser.toObject();
      delete userObject.password; delete userObject.verificationToken; delete userObject.__v;
      res.status(200).json({ success: true, message: "Cập nhật hồ sơ thành công.", user: userObject });
    } catch (error) {
      console.error("Error updating current user profile:", error);
      res.status(500).json({ message: "Lỗi máy chủ khi cập nhật hồ sơ." });
    }
  }

  async getCart(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "Xác thực thất bại." });
      const user = await User.findById(userId).populate({
        path: "cart.productId",
        model: "Product",
        select: "name price images storeId categories inventory",
        populate: {
            path: "storeId",
            model: "Store",
            select: "name"
        }
      });
      if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
      res.json({ success: true, cart: user.cart || [] });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy giỏ hàng."});
    }
  }

  async updateCart(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "Xác thực thất bại." });
      const { productId, quantity } = req.body;
      if (!productId || typeof quantity !== 'number') {
        return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm hoặc số lượng không hợp lệ." });
      }
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
      const existingItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
      if (existingItemIndex > -1) {
        if (quantity <= 0) { user.cart.splice(existingItemIndex, 1); }
        else { user.cart[existingItemIndex].quantity = quantity; }
      } else {
        if (quantity > 0) { user.cart.push({ productId: new mongoose.Types.ObjectId(productId), quantity });}
        else { return res.status(400).json({ success: false, message: "Số lượng phải lớn hơn 0."}); }
      }
      await user.save();
      const updatedUser = await User.findById(userId).populate({
        path: "cart.productId", model: "Product", select: "name price images storeId categories inventory",
        populate: { path: "storeId", model: "Store", select: "name"}
      });
      res.json({ success: true, cart: updatedUser.cart, message: "Giỏ hàng đã được cập nhật." });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật giỏ hàng."});
    }
  }

  async removeFromCart(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "Xác thực thất bại." });
      const { productId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ." });
      }
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
      user.cart = user.cart.filter(item => item.productId.toString() !== productId);
      await user.save();
      const updatedUser = await User.findById(userId).populate({
        path: "cart.productId", model: "Product", select: "name price images storeId categories inventory",
        populate: { path: "storeId", model: "Store", select: "name"}
      });
      res.json({ success: true, cart: updatedUser.cart, message: "Sản phẩm đã được xóa." });
    } catch (error) {
       console.error("Error removing from cart:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa sản phẩm." });
    }
  }

  async clearCart(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Xác thực thất bại." });
        const user = await User.findById(userId);
        if (!user) { return res.status(404).json({ success: false, message: "User not found" }); }
        user.cart = [];
        await user.save();
        res.json({ success: true, message: "Giỏ hàng đã được xóa." });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa giỏ hàng." });
    }
  }
}
module.exports = new ProfileController();