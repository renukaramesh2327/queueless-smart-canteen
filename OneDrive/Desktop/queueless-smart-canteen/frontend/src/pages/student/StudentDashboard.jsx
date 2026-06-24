import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ShoppingBag, Zap, ChevronRight, Star, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ordersAPI, menuAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [queueStatus, setQueueStatus] = useState(null)
  const [popularItems, setPopularItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      ordersAPI.getActive(),
      menuAPI.getAll({ popular_only: true, available_only: true }),
      ordersAPI.myOrders(),
    ]).then(([q, m, o]) => {
      setQueueStatus(q.data)
      setPopularItems(m.data.slice(0, 6))
      setRecentOrders(o.data.slice(0, 3))
    }).finally(() => setLoading(false))

    // Poll queue status every 30s
    const timer = setInterval(() => {
      ordersAPI.getActive().then(({ data }) => setQueueStatus(data)).catch(() => {})
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  const queueColors = { low: 'bg-green-50 border-green-200 text-green-700', moderate: 'bg-yellow-50 border-yellow-200 text-yellow-700', busy: 'bg-orange-50 border-orange-200 text-orange-700', very_busy: 'bg-red-50 border-red-200 text-red-700' }
  const statusLabels = { placed: 'Placed', accepted: 'Accepted', preparing: '👨‍🍳 Preparing', ready: '✅ Ready!', completed: 'Completed', cancelled: 'Cancelled' }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="hero-gradient rounded-2xl p-6 md:p-8 text-white">
        <p className="text-blue-300 text-sm font-medium mb-1">{greeting},</p>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{user?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-blue-200 text-sm mb-5">Skip the billing queue and collect your food when it is ready.</p>
        <Link to="/student/menu" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg">
          <ShoppingBag size={18} /> Order Now <ChevronRight size={16} />
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate(`/student/menu?search=${search}`)}
          placeholder="Search for food items..."
          className="input-field pl-11 py-3.5" />
      </div>

      {/* Queue status */}
      {queueStatus && (
        <div className={`rounded-2xl border p-4 ${queueColors[queueStatus.level] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg capitalize">{queueStatus.level?.replace('_', ' ')} Queue</p>
              <p className="text-sm opacity-80">{queueStatus.message}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold">~{queueStatus.estimated_wait_minutes}<span className="text-base font-medium">min</span></p>
              <p className="text-xs opacity-70">{queueStatus.active_orders} active orders</p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-60">⚡ Estimation based on current kitchen activity and historical data</p>
        </div>
      )}

      {/* Quick categories */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Browse by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            { label: 'Breakfast', emoji: '☀️' },
            { label: 'South Indian', emoji: '🍛' },
            { label: 'Rice & Meals', emoji: '🍚' },
            { label: 'Fast Food', emoji: '🍔' },
            { label: 'Snacks', emoji: '🥪' },
            { label: 'Beverages', emoji: '☕' },
            { label: 'Desserts', emoji: '🍦' },
            { label: 'All Items', emoji: '🍽️' },
          ].map(({ label, emoji }) => (
            <Link key={label} to={`/student/menu?category=${label === 'All Items' ? '' : label}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
              <span className="text-xs text-center font-medium text-gray-600 group-hover:text-primary-600 leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Active orders */}
      {recentOrders.filter(o => ['placed','accepted','preparing','ready'].includes(o.order_status)).length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Active Orders</h2>
          <div className="space-y-3">
            {recentOrders.filter(o => ['placed','accepted','preparing','ready'].includes(o.order_status)).map(order => (
              <Link key={order.id} to={`/student/orders/${order.id}/track`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition-all">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · ₹{order.total_amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold status-${order.order_status}`}>
                    {statusLabels[order.order_status]}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Popular Items</h2>
          <Link to="/student/menu" className="text-sm text-primary-500 font-medium hover:text-primary-600">View all</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {popularItems.map(item => (
              <PopularCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PopularCard({ item }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/student/menu`)} className="food-card overflow-hidden cursor-pointer">
      <div className="relative h-36 bg-gray-100">
        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://via.placeholder.com/280x144/f97316/ffffff?text=${encodeURIComponent(item.name[0])}` }} />
        <span className={`absolute top-2 left-2 ${item.food_type === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
          {item.food_type === 'veg' ? 'V' : 'NV'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-primary-500">₹{item.price}</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            {item.rating}
          </div>
        </div>
      </div>
    </div>
  )
}
