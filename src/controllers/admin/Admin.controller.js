const { resExport } = require("../../enums/resExport");
const AdminService = require("../../services/admin/Admin.service");
const { MESSAGE } = require("../../messages/message");
const User = require("../../models/User");
const Order = require("../../models/Orders/Order");
const LogRequest = require("../../models/system/LogRequest");
const moment = require("moment-timezone");
const Store = require("../../models/Store/Store");
const Product = require("../../models/Product/Product");
const Voucher = require("../../models/Voucher/Voucher");
const ExcelJS = require("exceljs");
const mongoose = require("mongoose");

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

  // Lấy danh sách đơn hàng (phân trang, populate đầy đủ)
  async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const total = await Order.countDocuments();

      const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email")
        .populate("storeId", "name")
        .populate("items.productId", "name")
        .populate("shippingInfo", "name phone")
        .populate(
          "items.appliedVoucherInfo.voucherId",
          "code discountType discountValue"
        );

      const result = orders.map((order) => {
        const totalQuantity = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalVoucher = order.items.reduce(
          (sum, item) => sum + (item.discountApplied || 0),
          0
        );
        const voucherCommission = Math.round(totalVoucher * 0.05);

        return {
          _id: order._id,
          orderCode: order.orderCode,
          user: order.userId,
          store: order.storeId,
          items: order.items.map((item) => ({
            productId: item.productId?._id,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            originalSubTotal: item.originalSubTotal,
            discountApplied: item.discountApplied,
            finalSubTotal: item.finalSubTotal,
            voucher: item.appliedVoucherInfo?.voucherId
              ? {
                  _id: item.appliedVoucherInfo.voucherId._id,
                  code: item.appliedVoucherInfo.voucherId.code,
                  discountType: item.appliedVoucherInfo.voucherId.discountType,
                  discountValue:
                    item.appliedVoucherInfo.voucherId.discountValue,
                }
              : null,
            voucherCode: item.appliedVoucherInfo?.code,
            calculatedDiscountForItem:
              item.appliedVoucherInfo?.calculatedDiscountForItem,
          })),
          totalQuantity,
          subTotal: order.subTotal,
          totalDiscount: order.totalDiscount,
          shippingFee: order.shippingFee,
          totalAmount: order.totalAmount,
          totalVoucher,
          voucherCommission,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          shippingInfo: order.shippingInfo,
        };
      });

      res.json({
        total,
        page,
        limit,
        orders: result,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // Xuất Excel danh sách đơn hàng
  async exportOrdersExcel(req, res) {
    try {
      const { storeIds, years, months, weeks, days } = req.query;
      const filter = {};

      // Store
      let storeObjectIds = [];
      if (storeIds) {
        const ids = storeIds.split(",").filter(Boolean);
        if (ids.length > 0) {
          storeObjectIds = ids.map((id) => mongoose.Types.ObjectId(id));
          filter.storeId = { $in: storeObjectIds };
        }
      }

      // Year, month, week
      let dateFilters = [];
      if (years) {
        const yearArr = years.split(",");
        yearArr.forEach((year) => {
          if (months) {
            const monthArr = months.split(",");
            monthArr.forEach((month) => {
              if (weeks) {
                const weekArr = weeks.split(",");
                weekArr.forEach((week) => {
                  // Tính toán start/end cho từng tuần
                  // ... (tương tự như cũ, nhưng lặp qua từng tổ hợp)
                  // Push vào dateFilters
                });
              } else {
                // Push start/end của tháng vào dateFilters
              }
            });
          } else {
            // Push start/end của năm vào dateFilters
          }
        });
      }
      if (dateFilters.length > 0) {
        filter.$or = dateFilters.map(({ start, end }) => ({
          createdAt: { $gte: start, $lte: end },
        }));
      }

      // Days
      if (days) {
        const dayArr = days.split(",");
        filter.$or = dayArr.map((d) => {
          const start = new Date(`${d}T00:00:00.000Z`);
          const end = new Date(`${d}T23:59:59.999Z`);
          return { createdAt: { $gte: start, $lte: end } };
        });
      }

      // Get orders with populated fields
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .populate("userId", "username email")
        .populate("storeId", "name")
        .populate("items.productId", "name")
        .populate("shippingInfo", "name")
        .populate(
          "items.appliedVoucherInfo.voucherId",
          "code discountType discountValue"
        );

      // Get store name for filename
      let storeName = "HeThong";
      if (storeObjectIds.length > 0) {
        const stores = await Store.find({ _id: { $in: storeObjectIds } });
        if (stores.length > 0) {
          // Remove accents and special characters from store names
          storeName = stores
            .map((store) =>
              store.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9]/g, "")
                .replace(/\s+/g, "")
            )
            .join(", ");
        }
      }

      // Generate time label for filename
      let timeLabel = "";
      if (years && months && weeks) {
        timeLabel = `Tuan${weeks}_Thang${months}_Nam${years}`;
      } else if (years && months) {
        timeLabel = `Thang${months}_Nam${years}`;
      } else if (years) {
        timeLabel = `Nam${years}`;
      } else {
        timeLabel = "TatCa";
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      // Set columns
      worksheet.columns = [
        { header: "Mã đơn hàng", key: "orderCode", width: 20 },
        { header: "Khách hàng", key: "user", width: 20 },
        { header: "Cửa hàng", key: "store", width: 20 },
        { header: "Tên sản phẩm", key: "productName", width: 25 },
        { header: "Số lượng", key: "quantity", width: 10 },
        { header: "Giá gốc", key: "unitPrice", width: 15 },
        { header: "Voucher áp dụng", key: "voucherCode", width: 20 },
        { header: "Giảm giá", key: "discountApplied", width: 15 },
        { header: "Tổng tiền", key: "totalAmount", width: 15 },
        { header: "Tổng voucher", key: "totalVoucher", width: 15 },
        { header: "Hoa hồng voucher", key: "voucherCommission", width: 18 },
        { header: "Trạng thái", key: "status", width: 15 },
        { header: "Ngày tạo", key: "createdAt", width: 20 },
      ];

      // Add data rows
      orders.forEach((order) => {
        // Kiểm tra có voucher và trạng thái confirmed
        const hasVoucher = order.items.some(
          (item) => item.appliedVoucherInfo && item.appliedVoucherInfo.voucherId
        );
        let voucherCommission = 0;
        if (hasVoucher && order.status === "confirmed") {
          voucherCommission = Math.round(order.subTotal * 0.05);
        }

        order.items.forEach((item) => {
          worksheet.addRow({
            orderCode: order.orderCode || "",
            user: order.shippingInfo?.name || "",
            store: order.storeId?.name || "",
            productName: item.productName || "",
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            voucherCode: item.appliedVoucherInfo?.code || "",
            discountApplied: item.discountApplied || 0,
            totalAmount: order.totalAmount || 0,
            totalVoucher: order.totalVoucher || 0,
            voucherCommission: voucherCommission || 0,
            status: order.status || "",
            createdAt: moment(order.createdAt).format("DD/MM/YYYY HH:mm:ss"),
          });
        });
      });

      // Generate filename
      const fileName = `BaoCao_${storeName}_${timeLabel}.xlsx`;

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (e) {
      console.error("Export Excel error:", e);
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new AdminController();
