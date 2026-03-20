const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    barcode: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String, required: true },
    imageUrl: { type: String },
    unit: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
