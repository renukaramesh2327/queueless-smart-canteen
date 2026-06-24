import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Download, MapPin, Clock, ArrowRight, Share2 } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersAPI.getOne(id).then(({ data }) => setOrder(data)).catch(() => toast.error('Order not found')).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!order) return <div className="text-center py-16"><p className="text-gray-500">Order not found</p></div>

  const qrValue = `CB:${order.order_number}:${order.pickup_token}`

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Success header */}
      <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Order Placed! 🎉</h1>
        <p className="text-gray-600 text-sm">Your order has been received by the canteen</p>
        <div className="mt-4 inline-block bg-white rounded-xl px-4 py-2 shadow-sm">
          <p className="text-xs text-gray-500">Order Number</p>
          <p className="font-bold text-gray-900 text-lg">{order.order_number}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="card p-6 text-center">
        <h2 className="font-bold text-gray-900 mb-1">Your Pickup QR Code</h2>
        <p className="text-sm text-gray-500 mb-5">Show this at the pickup counter when your order is ready</p>
        <div className="bg-white inline-block p-4 rounded-2xl shadow-md border border-gray-100 mx-auto">
          <QRCodeSVG value={qrValue} size={180} level="M" includeMargin={false}
            fgColor="#1e3a8a" bgColor="#ffffff" />
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Or use your pickup token</p>
          <div className="text-4xl font-extrabold tracking-widest text-primary-500">{order.pickup_token}</div>
        </div>
        <div className="mt-4 flex gap-2 justify-center text-xs text-gray-500">
          <MapPin size={13} className="text-primary-500" />
          <span>Counter #{order.pickup_counter}</span>
        </div>
      </div>

      {/* Order details */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-3">Order Details</h3>
        <div className="space-y-2">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.item_name} × {item.quantity}</span>
              <span className="font-medium">₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{order.tax_amount?.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Packaging</span><span>₹{order.packaging_charge?.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span><span className="text-primary-500">₹{order.total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoChip label="Payment" value={order.payment_method?.replace('_', ' ')} />
          <InfoChip label="Status" value={order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'} />
        </div>
        {order.estimated_ready_time && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock size={18} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-orange-700 font-semibold">Estimated Ready Time</p>
              <p className="text-sm font-bold text-orange-800">
                {new Date(order.estimated_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link to={`/student/orders/${order.id}/track`}
          className="flex-1 btn-primary flex items-center justify-center gap-2">
          Track Order <ArrowRight size={16} />
        </Link>
        <Link to="/student/menu" className="flex-1 btn-secondary text-center">Order More</Link>
      </div>
    </div>
  )
}

function InfoChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
    </div>
  )
}
