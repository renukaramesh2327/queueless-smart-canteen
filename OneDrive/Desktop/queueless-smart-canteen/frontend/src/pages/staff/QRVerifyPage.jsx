import { useState, useRef } from 'react'
import { QrCode, Search, CheckCircle, XCircle, Package } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function QRVerifyPage() {
  const [mode, setMode] = useState('token') // token | order_number
  const [input, setInput] = useState('')
  const [orderId, setOrderId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const searchOrder = async () => {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    try {
      // Search through staff orders for matching token or order number
      const { data: orders } = await ordersAPI.getStaffOrders('ready')
      const found = orders.find(o =>
        mode === 'token' ? o.pickup_token === input.trim() : o.order_number === input.trim().toUpperCase()
      )
      if (!found) {
        // Also search all statuses
        const { data: allOrders } = await ordersAPI.getStaffOrders('all')
        const anyFound = allOrders.find(o =>
          mode === 'token' ? o.pickup_token === input.trim() : o.order_number === input.trim().toUpperCase()
        )
        if (anyFound) {
          setResult({ order: anyFound, error: anyFound.order_status !== 'ready' ? `Order is not ready. Current status: ${anyFound.order_status}` : null })
          setOrderId(anyFound.id)
        } else {
          setResult({ error: 'No order found with this ' + (mode === 'token' ? 'pickup token' : 'order number') })
        }
      } else {
        setResult({ order: found })
        setOrderId(found.id)
      }
    } catch { toast.error('Search failed') } finally { setLoading(false) }
  }

  const handleVerify = async () => {
    if (!result?.order) return
    setVerifying(true)
    try {
      const payload = mode === 'token' ? { pickup_token: input.trim() } : { order_number: input.trim().toUpperCase() }
      await ordersAPI.verifyPickup(result.order.id, payload)
      toast.success('✅ Pickup verified! Order completed.')
      setResult(prev => ({ ...prev, completed: true }))
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Verification failed')
    } finally { setVerifying(false) }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-extrabold text-gray-900">QR Pickup Verification</h1>

      {/* Mode selector */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[['token', '🔢 Pickup Token'], ['order_number', '📋 Order Number']].map(([val, label]) => (
          <button key={val} onClick={() => { setMode(val); setInput(''); setResult(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Manual input */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3">
          {mode === 'token' ? 'Enter Pickup Token' : 'Enter Order Number'}
        </h3>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchOrder()}
            placeholder={mode === 'token' ? '4-digit token e.g. 7284' : 'e.g. CB-20240601-ABCD'}
            className="input-field flex-1 text-lg font-bold tracking-widest text-center"
            maxLength={mode === 'token' ? 4 : 20} />
          <button onClick={searchOrder} disabled={loading}
            className="btn-primary flex items-center gap-2 px-5 disabled:opacity-60">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
            Search
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {mode === 'token' ? 'Ask the student for the 4-digit token shown in their order' : 'Scan QR or manually enter the order number starting with CB-'}
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className={`card p-5 ${result.error ? 'border-red-200 bg-red-50' : result.completed ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
          {result.error ? (
            <div className="flex items-center gap-3 text-red-700">
              <XCircle size={24} className="flex-shrink-0" />
              <div>
                <p className="font-bold">Not Found</p>
                <p className="text-sm">{result.error}</p>
              </div>
            </div>
          ) : result.completed ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
              <p className="font-extrabold text-lg text-green-800">Pickup Complete!</p>
              <p className="text-sm text-green-700">{result.order?.order_number} has been handed over</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package size={22} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{result.order?.order_number}</p>
                  <p className="text-sm text-gray-600">Token: {result.order?.pickup_token} · Counter #{result.order?.pickup_counter}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold status-${result.order?.order_status}`}>{result.order?.order_status}</span>
                </div>
                <p className="font-bold text-primary-500">₹{result.order?.total_amount?.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 mb-2">ORDER ITEMS</p>
                {result.order?.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.item_name}</span>
                    <span className="font-medium">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {result.order?.order_status === 'ready' ? (
                <button onClick={handleVerify} disabled={verifying}
                  className="w-full btn-primary py-3 text-base disabled:opacity-60 flex items-center justify-center gap-2">
                  {verifying ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={20} />}
                  Confirm Pickup & Complete Order
                </button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                  <p className="text-sm text-yellow-700 font-medium">⚠️ Order status: <strong>{result.order?.order_status}</strong></p>
                  <p className="text-xs text-yellow-600 mt-1">Order must be "Ready" before pickup can be confirmed</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-400">📱 For QR scanning: ask student to show their phone. Staff enters the 4-digit token as a fallback.</p>
      </div>
    </div>
  )
}
