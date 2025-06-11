const ProductService = require("../services/Product.service");
const Product = require("../models/Product/Product");
const Voucher = require("../models/Voucher/Voucher");
const Order = require("../models/Orders/Order");

class ProductController {
  async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      const result = await ProductService.getAllProducts(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await ProductService.updateProduct(
        req.params.id,
        req.body
      );
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const product = await ProductService.deleteProduct(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getProductsByStore(req, res) {
    try {
      const result = await ProductService.getProductsByStore(
        req.params.storeId,
        req.query
      );
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const result = await ProductService.getProductsByCategory(
        req.params.categoryId,
        req.query
      );
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  async getFlashSaleProducts(req, res) {
    try {
      // 1. Lấy tất cả sản phẩm đang active
      const products = await Product.find({
        isActive: true,
      });

      // 2. Lấy tất cả voucher còn hiệu lực
      const now = new Date();
      const vouchers = await Voucher.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      });

      // 3. Tính giá trị giảm tối đa cho từng sản phẩm
      const flashSaleProducts = products.map((product) => {
        // Chỉ lấy voucher đúng store và ngành hàng
        const applicableVouchers = vouchers.filter((voucher) => {
          const storeMatch =
            !voucher.storeId || voucher.storeId.equals(product.storeId);
          const categoryMatch =
            !voucher.applicableCategories?.length ||
            voucher.applicableCategories.some((catId) =>
              product.categories.includes(catId)
            );
          return storeMatch && categoryMatch;
        });

        // Tìm voucher tốt nhất
        let bestVoucher = null;
        let maxDiscount = 0;
        applicableVouchers.forEach((voucher) => {
          let discount = 0;
          if (voucher.discountType === "fixed") {
            discount = voucher.discountValue;
          } else if (voucher.discountType === "percentage") {
            discount = Math.round(
              (product.price * voucher.discountValue) / 100
            );
            if (voucher.maxDiscountAmount > 0) {
              discount = Math.min(discount, voucher.maxDiscountAmount);
            }
          }
          if (discount > maxDiscount) {
            maxDiscount = discount;
            bestVoucher = voucher;
          }
        });

        return {
          ...product.toObject(),
          bestVoucher,
          maxDiscount,
        };
      });

      // 4. Lấy top N sản phẩm giảm nhiều nhất
      const topDiscountProducts = flashSaleProducts
        .filter((p) => p.maxDiscount > 0)
        .sort((a, b) => b.maxDiscount - a.maxDiscount)
        .slice(0, 10);

      // 5. Lấy top N sản phẩm bán chạy nhất (dựa vào Order)
      const bestSellerAgg = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            sold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 10 },
      ]);
      const bestSellerIds = bestSellerAgg.map((p) => p._id.toString());
      const bestSellers = flashSaleProducts.filter((p) =>
        bestSellerIds.includes(p._id.toString())
      );

      // Gắn cờ bestSeller cho các sản phẩm bán chạy
      const flashSaleList = topDiscountProducts.map((p) => ({
        ...p,
        bestSeller: bestSellerIds.includes(p._id.toString()),
      }));

      res.json({ products: flashSaleList });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new ProductController();
