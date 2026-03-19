import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/products.js'
import listRoutes from './routes/list.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://listado-super-front.vercel.app'
  ]
}))
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err))

app.use('/api/products', productRoutes)
app.use('/api/list', listRoutes)

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`🚀 Server en http://localhost:${process.env.PORT || 3001}`)
  })
}

// Para Vercel — exportar el app
export default app