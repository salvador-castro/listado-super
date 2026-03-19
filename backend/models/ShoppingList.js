import mongoose from 'mongoose'

const shoppingListSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  checked: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now }
})

export default mongoose.model('ShoppingList', shoppingListSchema)