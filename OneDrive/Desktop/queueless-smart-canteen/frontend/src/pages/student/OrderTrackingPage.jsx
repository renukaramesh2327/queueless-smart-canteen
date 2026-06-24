import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Circle, Clock, MapPin, ChefHat, Package, ArrowLeft } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { QRCodeSVG } from 'qrcode.react'

const STEPS = [
  { status: 'placed',    icon: '📝', label: 'Order Placed',       desc: 'Your order has been received' },
  { status: 'accepted',  icon: '✅', label: 'Order Accepted',      desc: 'Kitchen is aware of your order' },
  { status: 'preparing', icon: '👨‍🍳', label: 'Being Prepared',     desc: 'Your food is being cooked' },
  { status: 'ready',     icon: '🔔', label: 'Ready for Pickup',    desc: 'Head to the pickup counter' },
  { status: 'completed', icon: '🎉', label: 'Order Completed',     desc: 'Enjoy your meal!' },
]

const STATUS_ORDER = ['placed','accepted','preparing','ready','completed']

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = () => ordersAPI.getOne(id).then(({ data }) => setOrder(data)).catch(() => {})

  useEffect(() => {
    fetchOrder().finally(() => setLoading(false))
    // Poll every 8 seconds
    const timer = setInterval(fetchOrder, 8000)
    return () => clearInterval(timer)
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!order) return <div className="text-center py-16 text-gray-500">Order not found</div>

  const currentIdx = STATUS_ORDER.indexOf(order.order_status)
  const isCancelled = order.order_status === 'cancelled'

  return (
    <div className="max-w-md mx-auto space-y-5">
      <Link to="/student/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      {/* Status header */}
      <div className={`card p-5 ${order.order_status === 'ready' ? 'bg-green-50 border-green-300' : order.order_status === 'completed' ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{order.order_number}</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">
              {isCancelled ? '❌ Cancelled' : STEPS.find(s => s.status === order.order_status)?.label || order.order_status}
            </p>
          </div>
          {!isCancelled && order.order_status !== 'completed' && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Est. ready</p>
              <p className="font-bold text-gray-700 text-sm">
                {order.estimated_ready_time
                  ? new Date(order.estimated_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'
                }
              </p>
            </div>
          )}
        </div>
        {order.order_status === 'ready' && (
          <div className="mt-3 bg-green-100 rounded-xl px-4 py-2 text-center">
            <p className="text-green-700 font-bold text-sm">🔔 Your food is ready! Go to Counter #{order.pickup_counter}</p>
          </div>
        )}
      </div>

      {/* Progress timeline */}
      {!isCancelled && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Order Progress</h3>
          <div className="space-y-0">
            {STEPS.filter(s => s.status !== 'cancelled').map((step, i) => {
              const stepIdx = STATUS_ORDER.indexOf(step.status)
              const done = stepIdx <= currentIdx
              const active = stepIdx === currentIdx
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${done ? 'bg-primary-500 shadow-md' : 'bg-gray-100'} ${active ? 'ring-4 ring-primary-100 animate-pulse' : ''}`}>
                      {done ? <CheckCircle size={20} className="text-white" /> : <span className="text-base">{step.icon}</span>}
                    </div>
                    {i < STEPS.filter(s => s.status !== 'cancelled').length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${stepIdx < currentIdx ? 'bg-primary-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className={`font-semibold text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className={`text-xs mt-0.5 ${active ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{active ? '⏳ In progress...' : step.desc}</p>
                    {done && step.status !== 'placed' && order.status_history?.find(h => h.new_status === step.status) && (
                      <p className="text-xs text-gray-300 mt-0.5">
                        {new Date(order.status_history.find(h => h.new_status === step.status).created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* QR for pickup */}
      {(order.order_status === 'ready' || order.order_status === 'accepted' || order.order_status === 'preparing') && (
        <div className="card p-5 text-center">
          <h3 className="font-bold text-gray-900 mb-3">Your Pickup QR</h3>
          <div className="inline-block p-3 bg-white rounded-xl shadow border border-gray-100">
            <QRCodeSVG value={`CB:${order.order_number}:${order.pickup_token}`} size={150} level="M" fgColor="#1e3a8a" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-widest text-primary-500">{order.pickup_token}</p>
          <p className="text-xs text-gray-400 mt-1">Show at Counter #{order.pickup_counter}</p>
        </div>
      )}

      {/* Order items */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-3">Items Ordered</h3>
        <div className="space-y-2">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.item_name} × {item.quantity}</span>
              <span className="font-medium">₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span><span className="text-primary-500">₹{order.total_amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {order.order_status === 'placed' && (
        <button onClick={() => {
          if (window.confirm('Cancel this order?')) {
            ordersAPI.cancel(id).then(() => {
              window.location.reload()
            }).catch(err => alert(err?.response?.data?.detail || 'Cannot cancel now'))
          }
        }} className="w-full py-3 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 font-semibold text-sm transition-all">
          Cancel Order
        </button>
      )}
    </div>
  )
}
