import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Volume2, VolumeX, RefreshCw, Clock } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { status: 'placed',    label: '🔔 New',       nextStatus: 'accepted',  nextLabel: 'Accept',  cls: 'border-blue-300 bg-blue-50' },
  { status: 'accepted',  label: '✅ Accepted',   nextStatus: 'preparing', nextLabel: 'Start Cooking', cls: 'border-indigo-300 bg-indigo-50' },
  { status: 'preparing', label: '👨‍🍳 Preparing', nextStatus: 'ready',    nextLabel: 'Mark Ready', cls: 'border-yellow-300 bg-yellow-50' },
  { status: 'ready',     label: '🟢 Ready',      nextStatus: null,        nextLabel: null,     cls: 'border-green-300 bg-green-50' },
]

export default function KitchenBoardPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(false)
  const prevCountRef = useRef(0)
  const audioCtxRef = useRef(null)

  const fetchOrders = () =>
    ordersAPI.getStaffOrders('all').then(({ data }) => {
      const active = data.filter(o => ['placed','accepted','preparing','ready'].includes(o.order_status))
      const newCount = active.filter(o => o.order_status === 'placed').length
      if (!muted && newCount > prevCountRef.current) playAlert()
      prevCountRef.current = newCount
      setOrders(active)
    }).catch(() => {})

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false))
    const t = setInterval(fetchOrders, 10000)
    return () => clearInterval(t)
  }, [muted])

  const playAlert = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { order_status: newStatus })
      toast.success(`Order moved to ${newStatus}`)
      fetchOrders()
    } catch { toast.error('Failed to update status') }
  }

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
    </div>
  )

  const getByStatus = (status) => orders.filter(o => o.order_status === status)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">Kitchen Order Board</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrders} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setMuted(!muted)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all ${muted ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {muted ? 'Muted' : 'Sound On'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
        {COLUMNS.map(col => (
          <div key={col.status} className={`rounded-2xl border-2 p-4 ${col.cls} min-h-[420px] flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{col.label}</h3>
              <span className="bg-white text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {getByStatus(col.status).length}
              </span>
            </div>
            <div className="space-y-3 flex-1">
              {getByStatus(col.status).map(order => (
                <OrderCard key={order.id} order={order} nextStatus={col.nextStatus} nextLabel={col.nextLabel} onUpdate={updateStatus} />
              ))}
              {getByStatus(col.status).length === 0 && (
                <div className="text-center py-6 text-sm text-gray-400">No orders</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order, nextStatus, nextLabel, onUpdate }) {
  const mins = Math.round((Date.now() - new Date(order.created_at)) / 60000)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm text-gray-900">{order.order_number}</p>
          <p className="text-xs text-gray-500 font-mono">Token: {order.pickup_token}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xs font-medium flex items-center gap-1 ${mins > 15 ? 'text-red-500' : mins > 8 ? 'text-yellow-600' : 'text-green-600'}`}>
            <Clock size={11} />{mins}m
          </div>
          <p className={`text-xs mt-0.5 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {order.items?.map(item => (
          <div key={item.id} className="flex justify-between text-xs text-gray-600">
            <span>{item.item_name}</span><span className="font-medium">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {order.preparation_notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
          <p className="text-xs text-yellow-700">📝 {order.preparation_notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-gray-700">₹{order.total_amount?.toFixed(0)}</span>
        {nextStatus && (
          <button onClick={() => onUpdate(order.id, nextStatus)}
            className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95">
            {nextLabel} <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
