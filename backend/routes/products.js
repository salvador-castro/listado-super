import express from 'express'
import Product from '../models/Product.js'

const router = express.Router()

router.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.json([])
  try {
    const byBarcode = await Product.findOne({ barcode: q })
    if (byBarcode) return res.json([byBarcode])
    const results = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    }).limit(10)
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router