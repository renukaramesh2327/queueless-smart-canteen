import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, CheckCircle, ChefHat, Bell, Clock, DollarSign, XCircle, TrendingUp } from 'lucide-react'
import { analyticsAPI, ordersAPI } from '../../services/api'

const STATUS_COLORS = {
  placed:    { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'border-blue-100' },
  accepted:  { bg: 'bg-indigo-50', icon: 'text-indigo-500', border: 'border-indigo-100' },
  preparing: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100' },
  ready:     { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
  completed: { bg: 'bg-gray-50',   icon: 'text-gray-500',   border: 'border-gray-100' },
  cancelled: { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-100' },
}

export default function StaffDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = () => Promise.all([
    analyticsAPI.dashboard(),
    ordersAPI.getStaffOrders(),
  ]).then(([s, o]) => {
    setStats(s.data)
    setRecentOrders(o.data.slice(0, 5))
  }).catch(() => {})

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
    const t = setInterval(fetchData, 30000)
    return () => clearInterval(t)
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
    </div>
  )

  const cards = [
    { label: 'New Orders',    value: stats?.status_counts_today?.placed || 0,    icon: <Bell size={22} />,        color: STATUS_COLORS.placed },
    { label: 'Accepted',      value: stats?.status_counts_today?.accepted || 0,  icon: <CheckCircle size={22} />, color: STATUS_COLORS.accepted },
    { label: 'Preparing',     value: stats?.status_counts_today?.preparing || 0, icon: <ChefHat size={22} />,     color: STATUS_COLORS.preparing },
    { label: 'Ready',         value: stats?.status_counts_today?.ready || 0,     icon: <ShoppingBag size={22} />, color: STATUS_COLORS.ready },
    { label: 'Completed',     value: stats?.status_counts_today?.completed || 0, icon: <CheckCircle size={22} />, color: STATUS_COLORS.completed },
    { label: 'Cancelled',     value: stats?.status_counts_today?.cancelled || 0, icon: <XCircle size={22} />,     color: STATUS_COLORS.cancelled },
    { label: 'Today Revenue', value: `₹${stats?.today_revenue?.toFixed(0) || 0}`,icon: <DollarSign size={22} />,  color: { bg: 'bg-primary-50', icon: 'text-primary-500', border: 'border-primary-100' }},
    { label: 'Active Orders', value: stats?.active_orders || 0,                  icon: <TrendingUp size={22} />,  color: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-100' }},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Staff Dashboard</h1>
          <p className="text-sm text-gray-500">Today's overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Link to="/staff/kitchen" className="btn-primary text-sm py-2">Open Kitchen Board</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className={`card p-4 border ${color.border}`}>
            <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center mb-3 ${color.icon}`}>
              {icon}
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link to="/staff/orders" className="text-sm text-primary-500 font-medium">View all</Link>
        </div>
        <div className="space-y-3">
          {recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-semibold text-sm text-gray-900">{order.order_number}</p>
                <p className="text-xs text-gray-500">{order.items?.length} items · ₹{order.total_amount?.toFixed(0)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold status-${order.order_status}`}>
                {order.order_status}
              </span>
            </div>
          ))}
          {recentOrders.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No orders today yet</p>}
        </div>
      </div>
    </div>
  )
}
