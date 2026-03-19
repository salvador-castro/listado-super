import { useState, useEffect } from 'react'
import { getList, checkItem, removeItem, clearList, updateQuantity } from '../api'
import './ListPage.css'

export default function ListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchList = async () => {
    try {
      const res = await getList()
      setItems(res.data)
    } catch (err) {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
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

  const total = items.length
  const checked = items.filter(i => i.checked).length
  const pending = total - checked
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <p>Cargando lista...</p>
    </div>
  )

  if (error) return (
    <div className="error-state">
      <span>⚠️</span>
      <p>{error}</p>
      <button onClick={fetchList}>Reintentar</button>
    </div>
  )

  return (
    <div className="list-page">

      {/* Barra de progreso */}
      {total > 0 && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">
              {checked === total ? '🎉 ¡Lista completa!' : `${checked} de ${total} productos`}
            </span>
            <span className="progress-pending">
              {pending > 0 ? `${pending} pendiente${pending > 1 ? 's' : ''}` : ''}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
              data-complete={checked === total}
            />
          </div>
          <div className="progress-actions">
            <span className="progress-percent">{progress}%</span>
            <button className="btn-clear" onClick={handleClear}>Vaciar lista</button>
          </div>
        </div>
      )}

      {/* Lista vacía */}
      {total === 0 ? (
        <div className="empty-state">
          <span>🛒</span>
          <p>Tu lista está vacía</p>
          <small>Andá a "Agregar" para sumar productos</small>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => {
          const catChecked = catItems.filter(i => i.checked).length
          return (
            <div key={category} className="category-group">
              <div className="category-header">
                <h3 className="category-title">
                  {getCategoryEmoji(category)} {category}
                </h3>
                <span className="category-count">{catChecked}/{catItems.length}</span>
              </div>
              <ul className="item-list">
                {catItems.map(item => (
                  <li key={item._id} className={`list-item ${item.checked ? 'checked' : ''}`}>
                    <button className="checkbox" onClick={() => handleCheck(item)}>
                      <span className="checkbox-inner">{item.checked ? '✓' : ''}</span>
                    </button>
                    <div className="item-info">
                      <strong>{item.productId?.name}</strong>
                      <span>{[item.productId?.brand, item.productId?.unit].filter(Boolean).join(' · ')}</span>
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
          )
        })
      )}
    </div>
  )
}

function getCategoryEmoji(cat) {
  const map = { 'Gaseosas': '🥤', 'Almacén': '🥫', 'Lácteos': '🥛', 'Carnes': '🥩', 'Verdulería': '🥦', 'Limpieza': '🧹', 'Panadería': '🍞', 'Congelados': '🧊', 'Bebidas': '🍷', 'Otros': '📦' }
  return map[cat] || '📦'
}