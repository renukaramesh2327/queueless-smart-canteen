import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, RefreshCw, Clock, Package } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { menuAPI } from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  placed:    { label: 'Placed',           cls: 'status-placed' },
  accepted:  { label: 'Accepted',         cls: 'status-accepted' },
  preparing: { label: 'Preparing',        cls: 'status-preparing' },
  ready:     { label: '✅ Ready!',        cls: 'status-ready' },
  completed: { label: 'Completed',        cls: 'status-completed' },
  cancelled: { label: 'Cancelled',        cls: 'status-cancelled' },
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { addItem } = useCart()

  useEffect(() => {
    ordersAPI.myOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  }, [])

  const active = orders.filter(o => ['placed','accepted','preparing','ready'].includes(o.order_status))
  const past = orders.filter(o => ['completed','cancelled'].includes(o.order_status))
  const shown = filter === 'active' ? active : filter === 'past' ? past : orders

  const handleReorder = async (order) => {
    // Add items back to cart
    const { data: menuItems } = await menuAPI.getAll({ available_only: true })
    let added = 0
    for (const oi of order.items) {
      const mi = menuItems.find(m => m.id === oi.menu_item_id)
      if (mi) {
        for (let i = 0; i < oi.quantity; i++) addItem({ id: mi.id, name: mi.name, price: mi.price, image_url: mi.image_url, food_type: mi.food_type })
        added++
      }
    }
    if (added > 0) toast.success(`${added} item(s) added to cart!`)
    else toast.error('Some items are no longer available')
  }

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['all', 'All'], ['active', `Active (${active.length})`], ['past', 'Past']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === val ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-600">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Your orders will appear here</p>
          <Link to="/student/menu" className="btn-primary inline-flex mt-4">Browse Menu</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(order => (
            <OrderCard key={order.id} order={order} onReorder={handleReorder} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onReorder }) {
  const cfg = STATUS_CONFIG[order.order_status] || { label: order.order_status, cls: 'bg-gray-100 text-gray-600' }
  const isActive = ['placed','accepted','preparing','ready'].includes(order.order_status)

  return (
    <div className="card p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {order.items?.slice(0, 3).map((item, i) => (
              <span key={i} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                {item.item_name}
              </span>
            ))}
            {order.items?.length > 3 && <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-primary-500">₹{order.total_amount?.toFixed(2)}</p>
          <p className="text-xs text-gray-400 capitalize mt-0.5">{order.payment_method?.replace('_', ' ')}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        {isActive ? (
          <Link to={`/student/orders/${order.id}/track`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-all">
            Track Order <ChevronRight size={14} />
          </Link>
        ) : (
          <Link to={`/student/orders/${order.id}/track`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-all">
            View Details <ChevronRight size={14} />
          </Link>
        )}
        {order.order_status === 'completed' && (
          <button onClick={() => onReorder(order)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-all">
            <RefreshCw size={14} /> Reorder
          </button>
        )}
      </div>
    </div>
  )
}
