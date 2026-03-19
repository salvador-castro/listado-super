import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const searchProducts = (q) => axios.get(`${BASE}/products/search?q=${q}`)
export const getList = () => axios.get(`${BASE}/list`)
export const addToList = (productId, quantity = 1) => axios.post(`${BASE}/list`, { productId, quantity })
export const checkItem = (id) => axios.patch(`${BASE}/list/${id}/check`)
export const updateQuantity = (id, quantity) => axios.patch(`${BASE}/list/${id}/quantity`, { quantity })
export const removeItem = (id) => axios.delete(`${BASE}/list/${id}`)
export const clearList = () => axios.delete(`${BASE}/list`)
export const createProduct = (data) => axios.post(`${BASE}/products`, data)
```