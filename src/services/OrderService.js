// src/services/OrderService.js
const mongoose = require("mongoose");
const Order = require("../models/Orders/Order");
const User = require("../models/user/User");
const Voucher = require("../models/Voucher/Voucher");
const Product = require("../models/Product/Product");
const ProductModel = mongoose.model("Product");

const OrderService = {
  placeOrder: async (
    userId,
    cartItemsFromClient,
    shippingInfoFromController,
    clientTotalAmount
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userDocument = await User.findById(userId).session(session);
      if (!userDocument) {
        throw new Error("User not found");
      }
      userDocument.orders = userDocument.orders || [];
      userDocument.vouchers = userDocument.vouchers || [];

      // Bước 1: Lấy thông tin đầy đủ của sản phẩm và gom nhóm theo storeId
      const productsDetailsWithStore = await Promise.all(
        cartItemsFromClient.map(async (cartItem) => {
          const product = await ProductModel.findById(cartItem.productId)
            .populate("storeId") // Populate để lấy thông tin store, bao gồm _id
            .session(session);
          if (!product || !product.isActive)
            throw new Error(
              `Sản phẩm ID ${cartItem.productId} không hợp lệ hoặc đã ngừng kinh doanh.`
            );
          if (!product.storeId || !product.storeId._id)
            throw new Error(
              `Sản phẩm ${product.name} không có thông tin cửa hàng hợp lệ.`
            );
          if (product.inventory < cartItem.quantity)
            throw new Error(
              `Sản phẩm ${product.name} không đủ tồn kho (còn ${product.inventory}, cần ${cartItem.quantity}).`
            );

          return {
            ...cartItem,
            productDetails: product,
            productStoreId: product.storeId._id.toString(), // Lấy storeId dạng string để gom nhóm
          };
        })
      );

      const itemsByStore = productsDetailsWithStore.reduce((acc, item) => {
        const storeId = item.productStoreId;
        if (!acc[storeId]) {
          acc[storeId] = [];
        }
        acc[storeId].push(item);
        return acc;
      }, {});

      const createdOrders = [];
      const overallAppliedVoucherIds = new Set(); // Theo dõi các voucherId gốc đã được áp dụng (để cập nhật usedQuantity một lần)

      // Bước 2: Tạo đơn hàng riêng cho mỗi cửa hàng
      for (const storeId in itemsByStore) {
        const storeCartItems = itemsByStore[storeId]; // Các cartItem (đã có productDetails) cho store này
        let currentOrderSubTotal = 0;
        let currentOrderTotalDiscount = 0;
        const currentOrderFinalItems = [];

        for (const cartItem of storeCartItems) {
          const product = cartItem.productDetails;
          const unitPrice = cartItem.priceAtOrder || product.price;
          const itemOriginalSubTotal = unitPrice * cartItem.quantity;
          let itemDiscountAmount = 0;
          let appliedVoucherDetailsForThisItem = null;

          currentOrderSubTotal += itemOriginalSubTotal;

          if (cartItem.appliedVoucherId && cartItem.voucherDetailsAtOrder) {
            const voucher = await Voucher.findById(
              cartItem.appliedVoucherId
            ).session(session);
            // Validate voucher với item và store hiện tại
            if (
              voucher &&
              voucher.isActive &&
              new Date(voucher.startDate) <= new Date() &&
              new Date(voucher.endDate) >= new Date() &&
              (voucher.usedQuantity || 0) < voucher.totalQuantity
            ) {
              let isVoucherValidForThisItem = true;
              // 1. Kiểm tra storeId của voucher với storeId của đơn hàng con này
              if (voucher.storeId && voucher.storeId.toString() !== storeId) {
                isVoucherValidForThisItem = false;
                console.warn(
                  `Voucher ${voucher.code} (store: ${voucher.storeId}) không áp dụng cho đơn hàng của store ${storeId}.`
                );
              }
              // 2. Kiểm tra minPurchaseAmount (áp dụng cho item này, hoặc toàn bộ giá trị các item của store này nếu voucher áp dụng cho store)
              //    Hiện tại logic đang là minPurchaseAmount cho từng item.
              if (
                isVoucherValidForThisItem &&
                voucher.minPurchaseAmount &&
                itemOriginalSubTotal < voucher.minPurchaseAmount
              ) {
                isVoucherValidForThisItem = false;
                console.warn(
                  `Item "${product.name}" chưa đủ điều kiện cho voucher ${voucher.code} (minPurchase).`
                );
              }
              // 3. Kiểm tra applicableCategories
              if (
                isVoucherValidForThisItem &&
                voucher.applicableCategories &&
                voucher.applicableCategories.length > 0
              ) {
                const productCategoryStrings = product.categories.map((c) =>
                  c.toString()
                );
                const voucherCategoryStrings = voucher.applicableCategories.map(
                  (c) => c.toString()
                );
                if (
                  !productCategoryStrings.some((pc) =>
                    voucherCategoryStrings.includes(pc)
                  )
                ) {
                  isVoucherValidForThisItem = false;
                }
              }
              // 4. Kiểm tra applicableProducts
              if (
                isVoucherValidForThisItem &&
                voucher.applicableProducts &&
                voucher.applicableProducts.length > 0
              ) {
                const voucherApplicableProductStrings =
                  voucher.applicableProducts.map((p) => p.toString());
                if (
                  !voucherApplicableProductStrings.includes(
                    product._id.toString()
                  )
                ) {
                  isVoucherValidForThisItem = false;
                }
              }

              if (isVoucherValidForThisItem) {
                let discountCalculatedAtBackend = 0;
                if (voucher.discountType === "fixed") {
                  discountCalculatedAtBackend = voucher.discountValue;
                } else if (voucher.discountType === "percentage") {
                  discountCalculatedAtBackend =
                    (itemOriginalSubTotal * voucher.discountValue) / 100;
                  if (
                    voucher.maxDiscountAmount &&
                    discountCalculatedAtBackend > voucher.maxDiscountAmount
                  ) {
                    discountCalculatedAtBackend = voucher.maxDiscountAmount;
                  }
                }
                itemDiscountAmount = Math.min(
                  discountCalculatedAtBackend,
                  itemOriginalSubTotal
                );
                currentOrderTotalDiscount += itemDiscountAmount;

                appliedVoucherDetailsForThisItem = {
                  voucherId: voucher._id,
                  code: voucher.code,
                  discountType: voucher.discountType,
                  discountValue: voucher.discountValue,
                  calculatedDiscountForItem: itemDiscountAmount,
                };
                overallAppliedVoucherIds.add(voucher._id.toString()); // Thêm vào set để cập nhật sau
              } else {
                console.warn(
                  `Voucher ${voucher.code} không được áp dụng cho sản phẩm ${product.name} trong đơn hàng của store ${storeId} do không thỏa mãn điều kiện.`
                );
              }
            } else if (voucher) {
              console.warn(
                `Voucher ${voucher.code} không hợp lệ hoặc đã hết lượt/hết hạn (cho item ${product.name}).`
              );
            } else {
              console.warn(
                `Voucher ID ${cartItem.appliedVoucherId} không tìm thấy (cho item ${product.name}).`
              );
            }
          }

          currentOrderFinalItems.push({
            productId: product._id,
            productName: product.name,
            quantity: cartItem.quantity,
            unitPrice: unitPrice,
            originalSubTotal: itemOriginalSubTotal,
            discountApplied: itemDiscountAmount,
            finalSubTotal: itemOriginalSubTotal - itemDiscountAmount,
            appliedVoucherInfo: appliedVoucherDetailsForThisItem,
            // storeId không cần ở đây nữa vì đã có ở cấp Order
          });

          // Giảm inventory của sản phẩm
          product.inventory -= cartItem.quantity;
          await product.save({ session });
        } // Kết thúc for (const cartItem of storeItems)

        const currentOrderTotalAmount =
          currentOrderSubTotal - currentOrderTotalDiscount;

        const newOrderData = {
          userId: userId,
          storeId: new mongoose.Types.ObjectId(storeId), // <<--- GÁN storeId cho đơn hàng này
          items: currentOrderFinalItems,
          shippingInfo: {
            name: shippingInfoFromController.name,
            phone: shippingInfoFromController.phone,
            address: shippingInfoFromController.address,
          },
          subTotal: currentOrderSubTotal,
          totalDiscount: currentOrderTotalDiscount,
          totalAmount: currentOrderTotalAmount,
          status: "pending",
          paymentMethod: "COD",
          paymentStatus: "pending",
          // canCancel: false,
        };

        const order = new Order(newOrderData);
        const savedOrder = await order.save({ session });
        createdOrders.push(savedOrder);
        userDocument.orders.push(savedOrder._id);
      } // Kết thúc for (const storeId in itemsByStore)

      // Bước 3: Cập nhật trạng thái isUsed và usedQuantity cho các voucher gốc đã được áp dụng
      for (const voucherIdStr of overallAppliedVoucherIds) {
        const voucherToUpdate = await Voucher.findById(voucherIdStr).session(
          session
        );
        if (voucherToUpdate) {
          if (
            (voucherToUpdate.usedQuantity || 0) < voucherToUpdate.totalQuantity
          ) {
            await Voucher.updateOne(
              { _id: voucherToUpdate._id },
              { $inc: { usedQuantity: 1 } },
              { session }
            );
          }
          // Cập nhật isUsed trong user.vouchers cho voucher này
          // Nếu voucher có thể được lưu nhiều lần và mỗi lần lưu là một instance riêng trong user.vouchers
          // thì logic này cần tìm đúng instance (ví dụ, instance chưa isUsed)
          const userVoucherInstance = userDocument.vouchers.find(
            (v) =>
              v.voucherId &&
              v.voucherId.equals(voucherToUpdate._id) &&
              !v.isUsed
          );
          if (userVoucherInstance) {
            // Luôn set isUsed=true cho bản ghi user_voucher này khi nó đã được dùng trong đơn hàng
            userVoucherInstance.isUsed = true;
          } else {
            // Có thể voucher này là voucher công cộng không cần user lưu trước,
            // Hoặc user đã dùng hết các bản sao đã lưu của voucher này.
            console.warn(
              `Không tìm thấy bản ghi user_voucher chưa sử dụng cho voucherId ${voucherIdStr} của user ${userId}`
            );
          }
        }
      }
      await userDocument.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Trả về thông tin tóm tắt của các đơn hàng đã tạo
      return {
        success: true, // Thêm cờ success
        message: `Đã tạo ${createdOrders.length} đơn hàng.`,
        orders: createdOrders.map((o) => ({
          _id: o._id, // Trả về _id của đơn hàng
          orderCode: o.orderCode,
          totalAmount: o.totalAmount,
          storeId: o.storeId,
        })),
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(
        "Error in OrderService.placeOrder:",
        error.message,
        error.stack
      );
      throw error; // Ném lỗi để controller bắt và trả về cho client
    }
  },

  getOrdersByUserId: async (userId) => {
    try {
      const orders = await Order.find({ userId: userId })
        .populate({
          path: "items.productId",
          model: "Product",
          select: "name price images",
        }) // Bỏ storeId ở đây vì đã có ở cấp Order
        .populate({ path: "storeId", model: "Store", select: "name logo" })
        .populate({
          path: "items.appliedVoucherInfo.voucherId",
          model: "Voucher",
          select: "code description",
        })
        .sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      console.error("Error in OrderService.getOrdersByUserId:", error.message);
      throw error;
    }
  },

  getOrderById: async (orderId, userId) => {
    try {
      const order = await Order.findOne({ _id: orderId, userId: userId })
        .populate({
          path: "items.productId",
          model: "Product",
          select: "name price images",
        })
        .populate({ path: "storeId", model: "Store", select: "name logo" })
        .populate({
          path: "items.appliedVoucherInfo.voucherId",
          model: "Voucher",
          select: "code description discountType discountValue",
        });
      return order;
    } catch (error) {
      console.error("Error in OrderService.getOrderById:", error.message);
      throw error;
    }
  },

  // updateOrderStatusByUser: async (
  //   orderId,
  //   userId,
  //   newStatus,
  //   cancellationReason
  // ) => {
  //   try {
  //     // Tìm đơn hàng theo id và userId
  //     const order = await Order.findOne({ _id: orderId, userId });
  //     if (!order) throw new Error("Không tìm thấy đơn hàng.");

  //     // Nếu đơn không phải trạng thái pending thì không được hủy
  //     if (order.status !== "pending")
  //       throw new Error("Chỉ có thể hủy đơn ở trạng thái chờ xác nhận.");

  //     // Kiểm tra nếu người dùng muốn hủy đơn
  //     if (newStatus === "cancelled") {
  //       const now = new Date();
  //       const createdAt = new Date(order.createdAt);
  //       const diffMinutes = (now - createdAt) / (1000 * 60);

  //       if (diffMinutes < 5) {
  //         throw new Error("Không thể hủy đơn trong vòng 5 phút đầu tiên.");
  //       }

  //       // Nếu cửa hàng đã xác nhận đơn (status confirmed), không cho hủy
  //       if (order.status === "confirmed") {
  //         throw new Error("Đơn đã được xác nhận, không thể hủy.");
  //       }

  //       order.cancellationReason = cancellationReason || "Không rõ lý do";
  //     }

  //     order.status = newStatus;
  //     await order.save();

  //     return order;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  updateOrderStatusByUser: async (
    orderId,
    userId,
    newStatus,
    cancellationReason
  ) => {
    try {
      // Chỉ cho phép hủy nếu đơn thuộc user và đang ở trạng thái pending
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) throw new Error("Không tìm thấy đơn hàng.");
      if (order.status !== "pending")
        throw new Error("Chỉ có thể hủy đơn ở trạng thái chờ xác nhận.");

      order.status = newStatus;
      if (newStatus === "cancelled") {
        order.cancellationReason = cancellationReason || "Không rõ lý do";
      }
      await order.save();
      return order;
    } catch (error) {
      throw error;
    }
  },

  feedBackOrder: async (orderId, userId, feedback) => {
    try {
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) throw new Error("Không tìm thấy đơn hàng.");

      if (order.status !== "completed") {
        throw new Error("Chỉ có thể gửi phản hồi cho đơn hàng đã hoàn thành.");
      }

      for (const item of order.items) {
        const product = await Product.findById(item.productId._id);
        if (!product) continue;

        if (!product.feedBack) {
          product.feedBack = [];
        }

        product.feedBack.push({
          userId,
          comment: feedback.comment ? feedback.comment : "",
          rating: feedback.rating,
          createdAt: new Date(),
        });

        await product.save();
      }

      return { message: "Gửi phản hồi thành công." };
    } catch (error) {
      throw error;
    }
  }

};

module.exports = OrderService;
