const jwt = require("jsonwebtoken");
const secret = require("../configs/Secrets");
const User = require("../models/user/User");
const BlacklistedToken = require("../models/token/BlacklistedToken");
require('dotenv').config();
const {getPermissionsForUser} = require('../database/db');

// Simple user cache to reduce database queries
const userCache = new Map();
const USER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Helper function to get user from cache or database
const getUserById = async (userId) => {
  // Check if user is in cache and not expired
  const cachedUser = userCache.get(userId);
  if (cachedUser && cachedUser.timestamp > Date.now() - USER_CACHE_TTL) {
    return cachedUser.user;
  }
  
  // Get user from database
  const user = await User.findById(userId);
  
  // Update cache
  if (user) {
    userCache.set(userId, {
      user,
      timestamp: Date.now()
    });
  }
  
  return user;
};

// Check if a token is blacklisted
const isTokenBlacklisted = async (token) => {
  try {
    // Kiểm tra trong database
    const exists = await BlacklistedToken.exists({ token });
    return !!exists;
  } catch (error) {
    console.error('Error checking blacklisted token:', error);
    return false;
  }
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    console.log(token)

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Token has been invalidated",
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 401,
          message: "Đã hết phiên đăng nhập vui lòng đăng nhập lại !",
        });
      }
      throw error;
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Invalid token",
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Token has expired",
      });
    }

    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Người dùng không tồn tại !",
      });
    }

    if(user.status === "00"){
      return res.status(401).json({
        status: 401,
        message: "Tài khoản đã bị khóa hoặc vô hiệu hóa !",
      });
    }
    req.account = decoded;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: error.message || "Authentication failed",
    });
  }
};


auth.invalidateToken = async (token) => {
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }
  
  try {
    let expiryDate;
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        expiryDate = new Date(decoded.exp * 1000);
      } else {
        expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    } catch (error) {
      expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await BlacklistedToken.create({
      token,
      expiresAt: expiryDate
    });
  } catch (error) {
    console.error('Error invalidating token:', error);
  }
};

// Function to clear user cache (useful when user data is updated)
auth.clearUserCache = (userId) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
};

// Tạo scheduled job để dọn blacklist
const cleanupBlacklist = async () => {
  try {
    // Xóa token đã hết hạn
    await BlacklistedToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  } catch (error) {
    console.error('Error cleaning up blacklist:', error);
  }
};

// Chạy job cleanup mỗi ngày
setInterval(cleanupBlacklist, 24 * 60 * 60 * 1000);

module.exports = auth;
