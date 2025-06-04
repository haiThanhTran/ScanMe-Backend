const ProductService = require("../../services/store/Product.service");

class ProductController {
    async createProduct(req, res) {
        try {
            const product = await ProductService.createProduct(req.account.userId, req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: "Error creating product", error });
        }
    }
    async getProductsByStoreId(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const products = await ProductService.getProductsByStoreId(req.account.userId, parseInt(page), parseInt(limit));
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: "Error fetching products by store", error });
        }
    }

    async getProductsByStoreIdDetail(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.getById(id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: "Error fetching product by ID", error });
        }
    }

    async deleteProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.deleteProductById(id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.status(200).json({ message: "Product deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting product", error });
        }
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updatedProduct = await ProductService.updateProduct(id, req.body);
            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(500).json({ message: "Error updating product", error });
        }
    }

}

module.exports = new ProductController();
