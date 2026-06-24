import { useState } from 'react'
import { Download, FileText, BarChart2, Package } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function downloadReport(url, filename) {
  const token = localStorage.getItem('cb_token')
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
    })
    .catch(() => alert('Failed to download report'))
}

export default function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const reports = [
    {
      title: 'Daily Sales Report',
      desc: 'All orders for a specific date with payment details',
      icon: <FileText size={22} className="text-blue-500" />,
      color: 'border-blue-100 bg-blue-50',
      action: () => downloadReport(`${API_URL}/api/reports/daily-sales?date=${date}`, `sales_${date}.csv`),
      dateInput: true,
    },
    {
      title: 'Food Items Report',
      desc: 'Total quantity and revenue per food item (all time)',
      icon: <Package size={22} className="text-green-500" />,
      color: 'border-green-100 bg-green-50',
      action: () => downloadReport(`${API_URL}/api/reports/items-report`, 'items_report.csv'),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-gray-900">Reports & Exports</h1>
      <p className="text-sm text-gray-500">Download CSV reports for analysis. Reports include all relevant data fields.</p>

      <div className="grid md:grid-cols-2 gap-5">
        {reports.map(({ title, desc, icon, color, action, dateInput }) => (
          <div key={title} className={`card p-6 border ${color}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
            {dateInput && (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Select Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field text-sm py-2" max={new Date().toISOString().split('T')[0]} />
              </div>
            )}
            <button onClick={action} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Download size={16} /> Download CSV
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-700 font-medium">📊 Reports are generated in real time from the database. The CSV format is compatible with Excel and Google Sheets.</p>
      </div>
    </div>
  )
}
