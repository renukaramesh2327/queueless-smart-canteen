import { useState, useEffect } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const STATUSES = ['all','placed','accepted','preparing','ready','completed','cancelled']

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchOrders = () => ordersAPI.getStaffOrders(statusFilter !== 'all' ? statusFilter : null)
    .then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false))

  useEffect(() => { fetchOrders() }, [statusFilter])

  const filtered = orders.filter(o => !search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.pickup_token.includes(search))

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { order_status: newStatus })
      toast.success('Status updated')
      fetchOrders()
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">All Orders</h1>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order # or token..." className="input-field pl-9 text-sm py-2.5" />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all border ${statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{order.pickup_token}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold status-${order.order_status}`}>{order.order_status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {order.items?.map((item, i) => (
                      <span key={i} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-600">{item.item_name} ×{item.quantity}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-500">₹{order.total_amount?.toFixed(2)}</p>
                  <p className={`text-xs mt-0.5 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</p>
                </div>
              </div>
              {!['completed','cancelled'].includes(order.order_status) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50 flex-wrap">
                  {getNextStatuses(order.order_status).map(ns => (
                    <button key={ns} onClick={() => handleStatusChange(order.id, ns)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all capitalize border border-primary-200">
                      → {ns}
                    </button>
                  ))}
                  {order.order_status !== 'cancelled' && (
                    <button onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200">
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No orders found</div>}
        </div>
      )}
    </div>
  )
}

function getNextStatuses(current) {
  const flow = { placed: ['accepted'], accepted: ['preparing'], preparing: ['ready'], ready: ['completed'] }
  return flow[current] || []
}
