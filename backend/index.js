import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/products.js'
import listRoutes from './routes/list.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err))

app.use('/api/products', productRoutes)
app.use('/api/list', listRoutes)

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server en http://localhost:${process.env.PORT}`)
})
