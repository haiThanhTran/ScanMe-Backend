const Room = require("../../models/hotel/Room");
const Hotel = require("../../models/hotel/Hotel");

class RoomController {
  async getAllRooms(req, res) {
    try {
      const rooms = await Room.find()
        .populate("hotel_id") // Lấy thông tin khách sạn
        .populate("facility_id"); // Lấy thông tin tiện ích

      if (!rooms) {
        return res.status(404).json({ message: "Can not get list room" });
      }

      return res
        .status(200)
        .json({ message: "Get list room successfully", data: rooms });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng:", error);
      throw error;
    }
  }

  //   Get room by Id
  async getRoomById(req, res) {
    try {
      const { roomId } = req.params;

      const room = await Room.findById(roomId)
        .populate("hotel_id")
        .populate("facility_id")
        .exec();

      if (!room) {
        throw new Error("Không tìm thấy phòng");
      }

      return res
        .status(200)
        .json({ message: "Get room by id successfully", data: room });
    } catch (error) {
      console.error("Lỗi khi lấy phòng:", error);
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }

  // Create room
  async createRoom(req, res) {
    try {
      const {
        hotel_id,
        room_number,
        type,
        price,
        capacity,
        status,
        description,
        facility,
      } = req.body;

      // Tạo danh sách các trường thiếu
      const missingFields = [];

      if (!hotel_id) missingFields.push("hotel_id");
      if (!room_number) missingFields.push("room_number");
      if (!type) missingFields.push("type");
      if (!price) missingFields.push("price");
      if (!capacity) missingFields.push("capacity");
      if (!status) missingFields.push("status");
      if (!description) missingFields.push("description");
      if (!facility) missingFields.push("facility");

      // Nếu có trường thiếu, trả về lỗi
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `You have to fill all fields: ${missingFields.join(", ")}`,
        });
      }

      const newRoom = new Room({
        hotel_id,
        room_number,
        type,
        price,
        capacity,
        status,
        description,
        facility_id: facility,
      });
      await newRoom.save();

      return res
        .status(201)
        .json({ message: "Create room successfully", data: newRoom });
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      return res.status(500).json({ message: "Lỗi khi tạo phòng", error });
    }
  }

  // Update room
  async updateRoom(req, res) {
    try {
      const roomId = req.params.roomId;
      const updateData = req.body;

      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $set: updateData },
        {
          new: true,
          runValidators: true, // Đảm bảo dữ liệu hợp lệ theo schema
        }
      );

      if (!updatedRoom) {
        return res.status(404).json({ message: "Không tìm thấy phòng" });
      }

      console.log("update room", updatedRoom);

      return res
        .status(200)
        .json({ message: "Update room successfully", data: updatedRoom });
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng:", error);
      return res.status(500).json({ message: "Lỗi khi cập nhật phòng", error });
    }
  }

  // Delete room
  async deleteRoom(req, res) {
    try {
      const roomId = req.params.roomId;
      const deletedRoom = await Room.findByIdAndUpdate(roomId, {
        isDeleted: true,
      });

      if (!deletedRoom) {
        return res.status(404).json({ message: "Không tìm thấy phòng để xóa" });
      }

      return res
        .status(200)
        .json({ message: "Delete room successfully", data: deletedRoom });
    } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);
      return res.status(500).json({ message: "Lỗi khi xóa phòng", error });
    }
  }
}
module.exports = new RoomController();
