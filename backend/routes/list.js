const express = require("express");
const ShoppingList = require("../models/ShoppingList");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await ShoppingList.find()
      .populate("productId")
      .sort({ addedAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const existing = await ShoppingList.findOne({ productId });
    if (existing) {
      existing.quantity += quantity || 1;
      await existing.save();
      return res.json(existing);
    }
    const item = new ShoppingList({ productId, quantity: quantity || 1 });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id/check", async (req, res) => {
  try {
    const item = await ShoppingList.findById(req.params.id);
    item.checked = !item.checked;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id/quantity", async (req, res) => {
  try {
    const item = await ShoppingList.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true },
    );
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await ShoppingList.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await ShoppingList.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
