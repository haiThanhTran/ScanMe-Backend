const express = require("express");
const router = express.Router();
const RoomController = require("../../controllers/room/Room.controller");

const { checkPermission } = require("../../middleware/AuthPermission");


/**
 * @swagger
 * tags:
 *   name: Room
 *   description: API quản lý phòng khách sạn
 */


/**
 * @swagger
 * /api/room/get-by-id/{roomId}:
 *   get:
 *     summary: Lấy thông tin phòng theo ID
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lấy thông tin phòng thành công
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
 *                 price:
 *                   type: number
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 capacity:
 *                   type: integer
 *                 status:
 *                   type: string
 *       404:
 *         description: Không tìm thấy phòng
 *       500:
 *         description: Lỗi server
 */
router.get("/get-by-id/:roomId", RoomController.getRoomById);

/**
 * @swagger
 * /api/room:
 *   get:
 *     summary: Lấy danh sách phòng
 *     tags: [Room]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng phòng mỗi trang
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trạng thái phòng
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Lỗi server
 */
router.get("/", RoomController.getAllRooms);


/**
 * @swagger
 * /api/room:
 *   post:
 *     summary: Tạo phòng mới
 *     tags: [Room]
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
 *                 example: "Phòng Deluxe"
 *               description:
 *                 type: string
 *                 example: "Phòng sang trọng với view biển"
 *               price:
 *                 type: number
 *                 example: 1500000
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["url1.jpg", "url2.jpg"]
 *               capacity:
 *                 type: integer
 *                 example: 2
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.post("/", checkPermission(["SUPER", "MANAGER_ROOM_ADMIN"]), RoomController.createRoom);

/**
 * @swagger
 * /api/room/{roomId}:
 *   put:
 *     summary: Cập nhật thông tin phòng
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: "Phòng Deluxe"
 *               description:
 *                 type: string
 *                 example: "Phòng sang trọng với view biển"
 *               price:
 *                 type: number
 *                 example: 1500000
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["url1.jpg", "url2.jpg"]
 *               capacity:
 *                 type: integer
 *                 example: 2
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 example: "AVAILABLE"
 *     responses:
 *       200:
 *         description: Cập nhật phòng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phòng
 *       500:
 *         description: Lỗi server
 */
router.put("/:roomId", checkPermission(["SUPER", "MANAGER_ROOM_ADMIN"]), RoomController.updateRoom);

/**
 * @swagger
 * /api/room/{roomId}:
 *   delete:
 *     summary: Xóa phòng
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Xóa phòng thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phòng
 *       500:
 *         description: Lỗi server
 */
router.delete("/:roomId", checkPermission(["SUPER", "MANAGER_ROOM_ADMIN"]), RoomController.deleteRoom);



module.exports = router;
