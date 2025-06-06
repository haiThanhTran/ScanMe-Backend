const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  ],
  images: [{ type: String }],
  inventory: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  feedBack: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: { type: Number, required: true },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Product", ProductSchema, "Product");
