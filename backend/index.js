const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://listado-super-front.vercel.app"],
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

const productRoutes = require("./routes/products");
const listRoutes = require("./routes/list");

app.use("/api/products", productRoutes);
app.use("/api/list", listRoutes);

module.exports = app;
