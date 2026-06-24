import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { analyticsAPI } from '../../services/api'

const COLORS = ['#f97316','#1e3a8a','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#84cc16']

export default function AnalyticsPage() {
  const [sales7, setSales7] = useState([])
  const [sales30, setSales30] = useState([])
  const [popular, setPopular] = useState([])
  const [peakHours, setPeakHours] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [daysView, setDaysView] = useState(7)

  useEffect(() => {
    Promise.all([
      analyticsAPI.sales(7),
      analyticsAPI.sales(30),
      analyticsAPI.popularItems(10),
      analyticsAPI.peakHours(),
      analyticsAPI.monthlyRevenue(),
    ]).then(([s7, s30, p, ph, m]) => {
      setSales7(s7.data); setSales30(s30.data); setPopular(p.data); setPeakHours(ph.data); setMonthly(m.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}</div>

  const salesData = daysView === 7 ? sales7 : sales30

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-gray-900">Sales Analytics</h1>

      {/* Revenue overview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Revenue Trend</h3>
          <div className="flex gap-1">
            {[7, 30].map(d => (
              <button key={d} onClick={() => setDaysView(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${daysView === d ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                {d === 7 ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip formatter={v => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Order count */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Daily Order Count</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="order_count" stroke="#1e3a8a" strokeWidth={2.5} dot={{ fill: '#1e3a8a', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak hours */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Peak Order Hours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHours} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top items */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-4">Top 10 Items by Quantity Sold</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={popular} layout="vertical" margin={{ top: 0, right: 30, left: 5, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => [v, 'Qty sold']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="quantity" radius={[0,6,6,0]}>
              {popular.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly revenue */}
      {monthly.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#1e3a8a" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
