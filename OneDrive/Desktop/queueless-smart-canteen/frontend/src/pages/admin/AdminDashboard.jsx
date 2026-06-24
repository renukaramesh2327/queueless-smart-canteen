import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { analyticsAPI } from '../../services/api'

const COLORS = ['#f97316','#1e3a8a','#10b981','#f59e0b','#8b5cf6','#ef4444']

function StatCard({ title, value, sub, icon, color }) {
  return (
    <div className={`card p-5 border ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState([])
  const [popular, setPopular] = useState([])
  const [peakHours, setPeakHours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsAPI.dashboard(),
      analyticsAPI.sales(7),
      analyticsAPI.popularItems(8),
      analyticsAPI.peakHours(),
    ]).then(([s, sa, p, ph]) => {
      setStats(s.data)
      setSales(sa.data)
      setPopular(p.data)
      setPeakHours(ph.data)
    }).finally(() => setLoading(false))
  }, [])

  const statusPieData = stats ? Object.entries(stats.status_counts_today || {}).map(([k, v]) => ({ name: k, value: v })).filter(d => d.value > 0) : []

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.total_students || 0} icon="🎓" color="border-blue-100" />
        <StatCard title="Total Staff" value={stats?.total_staff || 0} icon="👨‍🍳" color="border-indigo-100" />
        <StatCard title="Today's Orders" value={stats?.today_orders || 0} icon="📦" color="border-orange-100" />
        <StatCard title="Today's Revenue" value={`₹${stats?.today_revenue?.toFixed(0) || 0}`} icon="💰" color="border-green-100" />
        <StatCard title="Total Orders" value={stats?.total_orders || 0} icon="🛒" color="border-gray-100" />
        <StatCard title="Completed" value={stats?.completed_orders || 0} icon="✅" color="border-green-100" />
        <StatCard title="Cancelled" value={stats?.cancelled_orders || 0} icon="❌" color="border-red-100" />
        <StatCard title="Active Now" value={stats?.active_orders || 0} icon="⚡" color="border-primary-100" />
      </div>

      {/* Sales chart */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-4">Revenue — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sales} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Popular items */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Top Items by Quantity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={popular.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="quantity" fill="#1e3a8a" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak hours */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Peak Order Hours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={peakHours} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order status pie */}
      {statusPieData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Today's Orders by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
