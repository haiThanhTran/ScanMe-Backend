const UserVoucherService = require("../services/UserVoucherService");
const jwt = require("jsonwebtoken");
require("dotenv").config();

jwtSecret: process.env.JWT_SECRET_KEY;

const UserVoucherController = {
  // Middleware to get user ID from token
  getUserIdFromToken: (req) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return null; // No token provided
    }
    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
      return null; // Invalid token format
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decoded.userId; // Assuming user ID is stored in 'sub' claim
    } catch (error) {
      console.error("Error decoding token:", error.message);
      return null; // Token verification failed
    }
  },

  // Save a voucher for the authenticated user
  saveVoucher: async (req, res) => {
    const userId = UserVoucherController.getUserIdFromToken(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or missing token" });
    }

    const { voucherId } = req.body;
    console.log("userId",userId)
    console.log("voucherId",voucherId)

    if (!voucherId) {
      return res.status(400).json({ message: "voucherId is required" });
    }

    try {
      const result = await UserVoucherService.saveVoucher(userId, voucherId);
      if (result.success) {
        res.status(200).json({success:true, message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to save voucher", error: error.message });
    }
  },

  // Get all saved vouchers for the authenticated user
  getSavedVouchers: async (req, res) => {
    const userId = UserVoucherController.getUserIdFromToken(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or missing token" });
    }

    try {
      const result = await UserVoucherService.getSavedVouchers(userId);
      if (result.success) {
        res.status(200).json({ data: result.data,success:true });
      } else {
        res.status(404).json({ message: result.message,success:false });
      }
    } catch (error) {
      res.status(500).json({
        message: "Failed to get saved vouchers",
        error: error.message,
      });
    }
  },

  // Delete a saved voucher for the authenticated user
  deleteSavedVoucher: async (req, res) => {
    const userId = UserVoucherController.getUserIdFromToken(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or missing token" });
    }

    const { voucherId } = req.params;
    console.log("voucherId",voucherId)
    try {
      const result = await UserVoucherService.deleteSavedVoucher(
        userId,
        voucherId
      );
      if (result.success) {
        res.status(200).json({success:true, message: result.message });
      } else {
        res.status(404).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete saved voucher",
        error: error.message,
      });
    }
  },
};

module.exports = UserVoucherController;
