const { resExport } = require("../../enums/resExport");
const AdminService = require("../../services/admin/Admin.service");
const { MESSAGE } = require("../../messages/message");
const User = require("../../models/User");
const Order = require("../../models/Orders/Order");
const LogRequest = require("../../models/system/LogRequest");
const moment = require("moment-timezone");

class AdminController {
  async getRole(req, res) {
    try {
      const resData = await AdminService.getAllRole();
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async createRole(req, res) {
    try {
      const resData = await AdminService.createRole(req.body);
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async updateRole(req, res) {
    try {
      const resData = await AdminService.updateRole(req.body);
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async getRolePermission(req, res) {
    try {
      const resData = await AdminService.getRolePermission();
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async updateRolePermission(req, res) {
    try {
      const resData = await AdminService.updateRolePermission(req.body);
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async getPermission(req, res) {
    try {
      const resData = await AdminService.getAllPermission();
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async createPermission(req, res) {
    try {
      const resData = await AdminService.createPermission(req.body);
      resExport(MESSAGE.SUCCESS.status, MESSAGE.SUCCESS.message, resData, res);
    } catch (e) {
      resExport(MESSAGE.ERROR.status, e.message, null, res);
    }
  }

  async dashboardOverview(req, res) {
    try {
      // Total Users
      const totalUsers = await User.countDocuments({});
      // Total Orders
      const totalOrders = await Order.countDocuments({});
      // Total Revenue (fix cứng)
      const totalRevenue = 56000;
      // New Customers (7 ngày gần nhất)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newCustomers = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      // Sales Overview (theo ngày)
      const salesOverview = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      // Visitors (log theo tháng)
      const visitors = await LogRequest.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Recent Transactions (4 đơn hàng mới nhất)
      const recentTransactions = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("userId", "username email");

      // New Users (3 user mới nhất)
      const newUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select("username email createdAt");

      // Lấy đầu ngày hôm nay theo giờ Việt Nam
      const startOfToday = moment()
        .tz("Asia/Ho_Chi_Minh")
        .startOf("day")
        .toDate();

      // Đếm user mới tạo hôm nay
      const newUsersToday = await User.countDocuments({
        createdAt: { $gte: startOfToday },
      });

      res.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        newCustomers,
        salesOverview,
        visitors,
        recentTransactions,
        newUsers,
        newUsersToday,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // Lấy danh sách người dùng (có phân trang, tìm kiếm)
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const result = await AdminService.getUsers({ page, limit, search });
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // Thêm người dùng mới
  async createUser(req, res) {
    try {
      const user = await AdminService.createUser(req.body);
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // Chỉnh sửa thông tin người dùng
  async updateUser(req, res) {
    try {
      const user = await AdminService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // Xóa người dùng
  async deleteUser(req, res) {
    try {
      await AdminService.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // Đổi vai trò người dùng
  async updateUserRole(req, res) {
    try {
      const user = await AdminService.updateUserRole(
        req.params.id,
        req.body.role
      );
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new AdminController();
