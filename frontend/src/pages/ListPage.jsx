import { useState, useEffect } from 'react'
import { getList, checkItem, removeItem, clearList, updateQuantity } from '../api'
import './ListPage.css'

export default function ListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchList = async () => {
    const res = await getList()
    setItems(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchList() }, [])

  const handleCheck = async (item) => {
    await checkItem(item._id)
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, checked: !i.checked } : i))
  }

  const handleRemove = async (id) => {
    await removeItem(id)
    setItems(prev => prev.filter(i => i._id !== id))
  }

  const handleQty = async (item, delta) => {
    const newQty = Math.max(1, item.quantity + delta)
    await updateQuantity(item._id, newQty)
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, quantity: newQty } : i))
  }

  const handleClear = async () => {
    if (!confirm('¿Vaciar toda la lista?')) return
    await clearList()
    setItems([])
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.productId?.category || 'Otros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const pending = items.filter(i => !i.checked).length

  if (loading) return <div className="loading">Cargando lista...</div>

  return (
    <div className="list-page">
      <div className="list-header">
        <div className="list-stats">
          <span>{items.length} productos</span>
          <span className="dot">·</span>
          <span>{pending} pendientes</span>
        </div>
        {items.length > 0 && <button className="btn-clear" onClick={handleClear}>Vaciar lista</button>}
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <span>🛒</span>
          <p>Tu lista está vacía</p>
          <small>Andá a "Agregar" para sumar productos</small>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="category-group">
            <h3 className="category-title">{getCategoryEmoji(category)} {category}</h3>
            <ul className="item-list">
              {catItems.map(item => (
                <li key={item._id} className={`list-item ${item.checked ? 'checked' : ''}`}>
                  <button className="check-btn" onClick={() => handleCheck(item)}>
                    {item.checked ? '✅' : '⬜'}
                  </button>
                  <div className="item-info">
                    <strong>{item.productId?.name}</strong>
                    <span>{item.productId?.brand} · {item.productId?.unit}</span>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => handleQty(item, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQty(item, 1)}>+</button>
                    <button className="btn-remove" onClick={() => handleRemove(item._id)}>🗑</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}

function getCategoryEmoji(cat) {
  const map = { 'Gaseosas': '🥤', 'Almacén': '🥫', 'Lácteos': '🥛', 'Carnes': '🥩', 'Verdulería': '🥦', 'Limpieza': '🧹', 'Panadería': '🍞', 'Congelados': '🧊', 'Bebidas': '🍷', 'Otros': '📦' }
  return map[cat] || '📦'
}
