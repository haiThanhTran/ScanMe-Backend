const express = require("express");
const router = express.Router();
const DiscountController = require("../../controllers/admin/Discount.controller");
const { checkPermission } = require("../../middleware/AuthPermission");
/**
 * @swagger
 * tags:
 *   name: Discount
 *   description: API quản lý mã giảm giá
 */

/**
 * @swagger
 * /api/admin/list_discount:
 *   get:
 *     summary: Lấy danh sách mã giảm giá
 *     tags: [Discount]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách mã giảm giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   code:
 *                     type: string
 *                   discount:
 *                     type: number
 *                   description:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.get("/list_discount", checkPermission(["SUPER", "MANAGER_DISCOUNT_ADMIN"]), DiscountController.getDiscount);
/**
 * @swagger
 * /api/admin/add_discount:
 *   post:
 *     summary: Thêm mới mã giảm giá
 *     tags: [Discount]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SUMMER2023"
 *               discount:
 *                 type: number
 *                 example: 10
 *               description:
 *                  type: string
 *                  example: "Giảm giá 10% mùa hè 2023"
 *               startDate:
 *                  type: string
 *                  format: date
 *                  example: "2023-06-01"
 *               endDate:
 *                  type: string
 *                  format: date
 *                  example: "2023-08-31"
 *     responses:
 *       201:
 *         description: Tạo mã giảm giá thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc mã đã tồn tại
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.post("/add_discount", checkPermission(["SUPER", "MANAGER_DISCOUNT_ADMIN"]), DiscountController.createDiscount);
/**
 * @swagger
 * /api/admin/update_discount/{id}:
 *   put:
 *     summary: Cập nhật mã giảm giá
 *     tags: [Discount]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của mã giảm giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SUMMER2023"
 *               discount:
 *                 type: number
 *                 example: 15
 *               description:
 *                  type: string
 *                  example: "Giảm giá 15% mùa hè 2023"
 *               startDate:
 *                  type: string
 *                  format: date
 *                  example: "2023-06-01"
 *               endDate:
 *                  type: string
 *                  format: date
 *                  example: "2023-08-31"
 *               status:
 *                  type: string
 *                  example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Cập nhật mã giảm giá thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy mã giảm giá
 *       500:
 *         description: Lỗi server
 */
router.put("/update_discount/:id", checkPermission(["SUPER", "MANAGER_DISCOUNT_ADMIN"]), DiscountController.updateDiscount);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Lấy thông tin mã giảm giá theo ID
 *     tags: [Discount]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của mã giảm giá
 *     responses:
 *       200:
 *         description: Lấy thông tin mã giảm giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 code:
 *                   type: string
 *                 discount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy mã giảm giá
 *       500:
 *         description: Lỗi server
 */
router.get("/:id", checkPermission(["SUPER", "MANAGER_DISCOUNT_ADMIN"]), DiscountController.getDiscountById);

/**
 * @swagger
 * /api/admin/delete_discount/{id}:
 *   delete:
 *     summary: Xóa mã giảm giá
 *     tags: [Discount]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của mã giảm giá
 *     responses:
 *       200:
 *         description: Xóa mã giảm giá thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy mã giảm giá
 *       500:
 *         description: Lỗi server
 */
router.delete("/delete_discount/:id", checkPermission(["SUPER", "MANAGER_DISCOUNT_ADMIN"]), DiscountController.deleteDiscount);

module.exports = router;
