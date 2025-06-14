const Product = require("../models/Product/Product");
const mongoose = require("mongoose");

class ProductService {
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllProducts(query = {}) {
    try {
      // Lấy các giá trị từ query
      const {
        stores: storeIds,         // Lấy query.stores và gán cho storeIds
        categories: categoryIds,  // Lấy query.categories và gán cho categoryIds
        search,
        sort: sortValue = "newest", // Lấy query.sort và gán cho sortValue, mặc định là "newest"
        page: queryPage,            // Lấy query.page và gán cho queryPage
        limit: queryLimit           // Lấy query.limit và gán cho queryLimit
        // categoryId không được sử dụng trực tiếp nếu đã có categoryIds, nên có thể bỏ qua
      } = query;

      // Chuyển đổi và đặt giá trị mặc định cho page và limit
      const page = parseInt(queryPage) || 1;   // Mặc định là trang 1
      const limit = parseInt(queryLimit) || 12; // Mặc định 12 item/trang (giống frontend của bạn)

      const filter = { isActive: true };

      if (storeIds) {
        const storeIdArray = Array.isArray(storeIds)
          ? storeIds
          : storeIds.split(",");
        if (storeIdArray.length > 0 && storeIdArray[0] !== '') { // Kiểm tra mảng không rỗng và phần tử đầu không phải chuỗi rỗng
          filter.storeId = {
            $in: storeIdArray.map((id) => new mongoose.Types.ObjectId(id.trim())),
          };
        }
      }

      if (categoryIds) {
        const categoryIdArray = Array.isArray(categoryIds)
          ? categoryIds
          : categoryIds.split(",");
        if (categoryIdArray.length > 0 && categoryIdArray[0] !== '') { // Kiểm tra mảng không rỗng
          filter.categories = {
            $in: categoryIdArray.map(
              (id) => new mongoose.Types.ObjectId(id.trim())
            ),
          };
        }
      }
      // Bỏ else if (categoryId) vì đã xử lý bằng categoryIds rồi

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const sortOption = {}; // Đổi tên biến từ 'sort' để tránh nhầm lẫn với tham số 'sort' từ query
      let actualSortBy = "createdAt";
      let actualSortOrder = -1; // Mặc định sắp xếp theo mới nhất (giảm dần theo createdAt)

      if (sortValue === "price_asc") {
        actualSortBy = "price";
        actualSortOrder = 1; // Tăng dần
      } else if (sortValue === "price_desc") {
        actualSortBy = "price";
        actualSortOrder = -1; // Giảm dần
      } else if (sortValue === "newest") {
        actualSortBy = "createdAt";
        actualSortOrder = -1; // Giảm dần (mới nhất lên đầu)
      }
      // Không cần khối else ở đây nữa vì sortValue đã có giá trị mặc định là "newest"
      // và các trường hợp khác không được frontend hỗ trợ.

      sortOption[actualSortBy] = actualSortOrder;

      const products = await Product.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit) // limit đã là số
        .populate("storeId", "name")
        .populate("categories", "name");

      const total = await Product.countDocuments(filter);

      return {
        products,
        pagination: {
          total,
          page: page, // page đã là số
          limit: limit, // limit đã là số
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      // Ném lỗi để controller bắt và xử lý
      console.error("Error in ProductService.getAllProducts:", error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await Product.findById(id)
        .populate("storeId", "name")
        .populate("categories", "name").populate("feedBack.userId");
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async getProductsByStore(storeId, query = {}) {
    try {
      const { page: queryPage = 1, limit: queryLimit = 10 } = query;
      const page = parseInt(queryPage);
      const limit = parseInt(queryLimit);
      const filter = {
        storeId: new mongoose.Types.ObjectId(storeId),
        isActive: true,
      };

      const products = await Product.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("categories", "name");

      const total = await Product.countDocuments(filter);

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getProductsByCategory(categoryId, query = {}) {
    try {
      const { page: queryPage = 1, limit: queryLimit = 10 } = query;
      const page = parseInt(queryPage);
      const limit = parseInt(queryLimit);
      const filter = {
        categories: new mongoose.Types.ObjectId(categoryId),
        isActive: true,
      };

      const products = await Product.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("storeId", "name");

      const total = await Product.countDocuments(filter);

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();