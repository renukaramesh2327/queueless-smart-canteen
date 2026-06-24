import { useState, useEffect } from 'react'
import { Package, AlertTriangle, XCircle } from 'lucide-react'
import { menuAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function StockPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [stockValues, setStockValues] = useState({})

  useEffect(() => {
    menuAPI.getAll({}).then(({ data }) => {
      setItems(data)
      const vals = {}
      data.forEach(i => { vals[i.id] = String(i.stock_quantity) })
      setStockValues(vals)
    }).finally(() => setLoading(false))
  }, [])

  const updateStock = async (item) => {
    setUpdatingId(item.id)
    try {
      await menuAPI.update(item.id, { stock_quantity: parseInt(stockValues[item.id] || 0) })
      toast.success(`${item.name} stock updated`)
      menuAPI.getAll({}).then(({ data }) => setItems(data))
    } catch { toast.error('Failed to update') } finally { setUpdatingId(null) }
  }

  const low = items.filter(i => i.stock_quantity > 0 && i.stock_quantity <= 10)
  const out = items.filter(i => i.stock_quantity === 0)
  const good = items.filter(i => i.stock_quantity > 10)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-gray-900">Stock Management</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 border-green-100">
          <div className="text-2xl mb-1">✅</div>
          <p className="text-2xl font-extrabold text-gray-900">{good.length}</p>
          <p className="text-xs text-gray-500">In Stock</p>
        </div>
        <div className="card p-4 border-yellow-200">
          <div className="text-2xl mb-1">⚠️</div>
          <p className="text-2xl font-extrabold text-yellow-700">{low.length}</p>
          <p className="text-xs text-gray-500">Low Stock (≤10)</p>
        </div>
        <div className="card p-4 border-red-200">
          <div className="text-2xl mb-1">❌</div>
          <p className="text-2xl font-extrabold text-red-600">{out.length}</p>
          <p className="text-xs text-gray-500">Out of Stock</p>
        </div>
      </div>

      {out.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-semibold text-red-700 flex items-center gap-2 mb-2"><XCircle size={16} /> Out of Stock Items</p>
          <div className="flex flex-wrap gap-2">
            {out.map(i => <span key={i.id} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{i.name}</span>)}
          </div>
        </div>
      )}

      {low.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="font-semibold text-yellow-700 flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Low Stock Items</p>
          <div className="flex flex-wrap gap-2">
            {low.map(i => <span key={i.id} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{i.name} ({i.stock_quantity})</span>)}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Package size={18} className="text-primary-500" /> All Items Stock</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.category?.name}</p>
                </div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.stock_quantity === 0 ? 'bg-red-100 text-red-700' : item.stock_quantity <= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {item.stock_quantity === 0 ? 'Out' : item.stock_quantity <= 10 ? 'Low' : 'OK'}
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="999"
                    value={stockValues[item.id] ?? item.stock_quantity}
                    onChange={e => setStockValues(p => ({ ...p, [item.id]: e.target.value }))}
                    className="w-20 input-field text-sm py-1.5 text-center" />
                  <button onClick={() => updateStock(item)} disabled={updatingId === item.id}
                    className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60">
                    {updatingId === item.id ? '...' : 'Update'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
