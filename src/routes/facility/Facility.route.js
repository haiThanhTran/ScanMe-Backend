// routes/facilityRoutes.js
const express = require("express");
const router = express.Router();
const FacilityControllers = require("../../controllers/facility/Facility.controller");
const {checkPermission} = require("../../middleware/AuthPermission");

/**
 * @swagger
 * tags:
 *   name: Facility
 *   description: API quản lý tiện nghi
 */

/**
 * @swagger
 * /api/facility:
 *   get:
 *     summary: Lấy danh sách tất cả tiện nghi
 *     tags: [Facility]
 *     responses:
 *       200:
 *         description: Lấy danh sách tiện nghi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   icon:
 *                     type: string
 *       500:
 *         description: Lỗi server
 */
router.get("/", FacilityControllers.getAllFacilities);

/**
 * @swagger
 * /api/facility/{id}:
 *   get:
 *     summary: Lấy thông tin tiện nghi theo ID
 *     tags: [Facility]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tiện nghi
 *         example: 1
 *     responses:
 *       200:
 *         description: Lấy thông tin tiện nghi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 icon:
 *                   type: string
 *       404:
 *         description: Không tìm thấy tiện nghi
 *       500:
 *         description: Lỗi server
 */
router.get("/:id", FacilityControllers.getFacilityById);

/**
 * @swagger
 * /api/facility:
 *   post:
 *     summary: Tạo tiện nghi mới
 *     tags: [Facility]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "WiFi"
 *               description:
 *                 type: string
 *                 example: "Internet tốc độ cao"
 *               icon:
 *                 type: string
 *                 example: "wifi-icon.svg"
 *     responses:
 *       201:
 *         description: Tạo tiện nghi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.post("/", checkPermission(["SUPER", "MANAGER_VATTU_ADMIN"]), FacilityControllers.createFacility);

/**
 * @swagger
 * /api/facility/{id}:
 *   put:
 *     summary: Cập nhật thông tin tiện nghi
 *     tags: [Facility]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tiện nghi
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "WiFi"
 *               description:
 *                 type: string
 *                 example: "Internet tốc độ cao"
 *               icon:
 *                 type: string
 *                 example: "wifi-icon.svg"
 *     responses:
 *       200:
 *         description: Cập nhật tiện nghi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy tiện nghi
 *       500:
 *         description: Lỗi server
 */
router.put("/:id", checkPermission(["SUPER", "MANAGER_VATTU_ADMIN"]), FacilityControllers.updateFacility);

/**
 * @swagger
 * /api/facility/{id}:
 *   delete:
 *     summary: Xóa tiện nghi
 *     tags: [Facility]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của tiện nghi
 *         example: 1
 *     responses:
 *       200:
 *         description: Xóa tiện nghi thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy tiện nghi
 *       500:
 *         description: Lỗi server
 */
router.delete("/:id", checkPermission(["SUPER", "MANAGER_VATTU_ADMIN"]), FacilityControllers.deleteFacility);

module.exports = router;
