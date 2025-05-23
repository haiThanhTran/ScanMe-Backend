const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const products = [
  {
    _id: new mongoose.Types.ObjectId("665300000000000000000001"),
    name: "Áo thun nam Shopee",
    description: "Áo thun cotton cao cấp, thoáng mát, nhiều màu sắc.",
    price: 120000,
    categories: [new mongoose.Types.ObjectId("665100000000000000000001")],
    images: ["https://cdn.example.com/product/shirt1.jpg"],
    inventory: 50,
    createdAt: new Date("2024-05-01T00:00:00.000Z"),
    updatedAt: new Date("2024-05-01T00:00:00.000Z"),
    isActive: true,
    storeId: new mongoose.Types.ObjectId("665000000000000000000001"),
  },
  {
    _id: new mongoose.Types.ObjectId("665300000000000000000002"),
    name: "Tai nghe Bluetooth Lazada",
    description: "Tai nghe không dây, pin 24h, chống ồn chủ động.",
    price: 350000,
    categories: [new mongoose.Types.ObjectId("665100000000000000000002")],
    images: ["https://cdn.example.com/product/headphone1.jpg"],
    inventory: 30,
    createdAt: new Date("2024-05-02T00:00:00.000Z"),
    updatedAt: new Date("2024-05-02T00:00:00.000Z"),
    isActive: true,
    storeId: new mongoose.Types.ObjectId("665000000000000000000002"),
  },
  // ... Add all other products from the sample data
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log("Seeded products successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
