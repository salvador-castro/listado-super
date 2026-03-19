import { useState, useRef, useEffect } from 'react'
import { searchProducts, addToList, createProduct } from '../api'
import { BrowserMultiFormatReader } from '@zxing/browser'
import './AddPage.css'

const CATEGORIES = ['Gaseosas', 'Almacén', 'Lácteos', 'Carnes', 'Verdulería', 'Limpieza', 'Panadería', 'Congelados', 'Bebidas', 'Otros']

export default function AddPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', category: 'Almacén', unit: '', barcode: '' })
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const streamRef = useRef(null)

  const stopScanner = () => {
    // Detener el reader de zxing
    if (readerRef.current) {
      try { readerRef.current.reset() } catch (e) { }
      readerRef.current = null
    }
    // Detener todos los tracks de la cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    // Limpiar el video
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
    setScanError(null)
  }

  const startScanner = () => {
    setScanError(null)
    setScanning(true)
  }

  useEffect(() => {
    if (!scanning) return

    let active = true

    const initReader = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream

        const reader = new BrowserMultiFormatReader()
        readerRef.current = reader

        reader.decodeFromStream(stream, videoRef.current, async (result, err) => {
          if (result && active) {
            const code = result.getText()
            stopScanner()
            setQuery(code)
            setLoading(true)
            try {
              const res = await searchProducts(code)
              setResults(res.data)
              if (res.data.length === 0) {
                setNewProduct(prev => ({ ...prev, barcode: code }))
              }
            } finally {
              setLoading(false)
            }
          }
        })
      } catch (err) {
        if (active) {
          setScanError('No se pudo acceder a la cámara. Verificá los permisos.')
          setScanning(false)
        }
      }
    }

    initReader()

    return () => {
      active = false
      stopScanner()
    }
  }, [scanning])

  const handleSearch = async (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.length < 2) return setResults([])
    setLoading(true)
    try {
      const res = await searchProducts(val)
      setResults(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (product) => {
    await addToList(product._id)
    setAdded(product.name)
    setResults([])
    setQuery('')
    setTimeout(() => setAdded(null), 2500)
  }

  const handleCreateProduct = async () => {
    try {
      const res = await createProduct(newProduct)
      await addToList(res.data._id)
      setAdded(res.data.name)
      setShowForm(false)
      setNewProduct({ name: '', brand: '', category: 'Almacén', unit: '', barcode: '' })
      setTimeout(() => setAdded(null), 2500)
    } catch (err) {
      alert('Error al crear el producto')
    }
  }

  return (
    <div className="add-page">
      {added && <div className="toast">✅ {added} agregado a la lista</div>}

      {/* Buscador */}
      <div className="search-section">
        <p className="search-label">¿Qué necesitás comprar?</p>
        <div className={`search-box ${scanning ? 'scanning' : ''}`}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Nombre, marca o código de barras..."
            value={query}
            onChange={handleSearch}
            autoFocus
          />
          {loading ? <span className="spinner" /> : null}
          <button
            className={`btn-scan ${scanning ? 'active' : ''}`}
            onClick={scanning ? stopScanner : startScanner}
            title={scanning ? 'Cerrar cámara' : 'Escanear código de barras'}
          >
            {scanning ? '✕' : '📷'}
          </button>
        </div>
        {scanError && <p className="scan-error">⚠️ {scanError}</p>}
      </div>

      {/* Cámara */}
      {scanning && (
        <div className="scanner-wrapper">
          <div className="scanner-container">
            <video ref={videoRef} autoPlay playsInline muted className="scanner-video" />
            <div className="scanner-overlay">
              <div className="scanner-frame">
                <span className="corner tl" /><span className="corner tr" />
                <span className="corner bl" /><span className="corner br" />
              </div>
              <p className="scanner-hint">Apuntá al código de barras</p>
            </div>
          </div>
          <button className="btn-stop-scan" onClick={stopScanner}>✕ Cancelar escaneo</button>
        </div>
      )}

      {/* Resultados */}
      {!scanning && results.length > 0 && (
        <div className="results-section">
          <p className="results-label">{results.length} resultado{results.length > 1 ? 's' : ''}</p>
          <ul className="results-list">
            {results.map(p => (
              <li key={p._id} className="result-item">
                <div className="result-emoji">{getCategoryEmoji(p.category)}</div>
                <div className="result-info">
                  <strong>{p.name}</strong>
                  <span>{[p.brand, p.unit].filter(Boolean).join(' · ')}</span>
                  <span className="category-badge">{p.category}</span>
                </div>
                <button onClick={() => handleAdd(p)} className="btn-add">+</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No encontrado */}
      {!scanning && query.length > 1 && results.length === 0 && !loading && (
        <div className="no-results">
          <div className="no-results-icon">🔎</div>
          <p>No encontramos <strong>"{query}"</strong></p>
          <span>¿Es un producto nuevo?</span>
          <button className="btn-create" onClick={() => {
            setShowForm(true)
            setNewProduct(p => ({ ...p, barcode: query.match(/^\d+$/) ? query : '' }))
          }}>
            + Crear producto nuevo
          </button>
        </div>
      )}

      {/* Formulario nuevo producto */}
      {showForm && (
        <div className="new-product-form">
          <div className="form-header">
            <h3>Nuevo producto</h3>
            <button className="btn-close-form" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <input placeholder="Nombre *" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Marca" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} />
          <input placeholder="Código de barras" value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} />
          <input placeholder="Unidad (500g, 1L, unidad...)" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} />
          <div className="category-grid">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`cat-btn ${newProduct.category === c ? 'selected' : ''}`}
                onClick={() => setNewProduct({ ...newProduct, category: c })}
              >
                {getCategoryEmoji(c)} {c}
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn-create-submit" onClick={handleCreateProduct} disabled={!newProduct.name}>
              Guardar y agregar a la lista
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryEmoji(cat) {
  const map = { 'Gaseosas': '🥤', 'Almacén': '🥫', 'Lácteos': '🥛', 'Carnes': '🥩', 'Verdulería': '🥦', 'Limpieza': '🧹', 'Panadería': '🍞', 'Congelados': '🧊', 'Bebidas': '🍷', 'Otros': '📦' }
  return map[cat] || '📦'
}