// src/routes/user/Profile.route.js
const express = require('express');
const router = express.Router();
const ProfileControllers = require('../../controllers/user/Profile.controller');
const  authMiddleware  = require("../../middleware/AuthMiddleware"); // Đảm bảo middleware này hoạt động đúng

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: API quản lý thông tin người dùng
 */

/**
 * @swagger
 * /api/user/profile/me:
 *   get:
 *     summary: Lấy thông tin cá nhân của người dùng hiện tại (đã đăng nhập)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *       401:
 *         description: Không có quyền truy cập / Token không hợp lệ.
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get('/profile/me', authMiddleware, ProfileControllers.getCurrentUserProfile);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân của người dùng hiện tại (tương tự /me, dùng cho tiện lợi hoặc tương thích ngược)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *       401:
 *         description: Không có quyền truy cập / Token không hợp lệ.
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ.
 */
// Sửa route này để trỏ đến getCurrentUserProfile và thêm authMiddleware
router.get('/profile', authMiddleware, ProfileControllers.getCurrentUserProfile);

/**
 * @swagger
 * /api/user/profile/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID (có thể cần quyền admin)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: [] # Cân nhắc thêm middleware kiểm tra quyền admin ở đây
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *       400:
 *         description: ID người dùng không hợp lệ.
 *       401:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get('/profile/:id', authMiddleware, ProfileControllers.getProfileById); // Giữ lại và đảm bảo có authMiddleware

/**
 * @swagger
 * /api/user/profile/update:
 *   put:
 *     summary: Cập nhật thông tin cá nhân của người dùng hiện tại
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn B"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               address:
 *                 type: string
 *                 example: "123 Đường ABC, Quận XYZ, TP HCM"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/new_avatar.jpg"
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc tên người dùng đã tồn tại.
 *       401:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.put('/profile/update', authMiddleware, ProfileControllers.updateCurrentUserProfile);

module.exports = router;