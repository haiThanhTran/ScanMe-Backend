const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoreSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String },
  categories: [{ type: String }],
  address: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Store", StoreSchema, "Store");
