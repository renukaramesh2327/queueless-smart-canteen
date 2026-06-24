import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'
import { settingsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const SETTING_FIELDS = [
  { key: 'canteen_name', label: 'Canteen Name', type: 'text' },
  { key: 'opening_time', label: 'Opening Time', type: 'time' },
  { key: 'closing_time', label: 'Closing Time', type: 'time' },
  { key: 'tax_percentage', label: 'Tax Percentage (%)', type: 'number' },
  { key: 'packaging_charge', label: 'Packaging Charge (₹)', type: 'number' },
  { key: 'pickup_counters', label: 'Number of Pickup Counters', type: 'number' },
  { key: 'max_simultaneous_orders', label: 'Max Simultaneous Orders', type: 'number' },
  { key: 'cancellation_window_minutes', label: 'Cancellation Window (minutes)', type: 'number' },
  { key: 'default_preparation_time', label: 'Default Prep Time (minutes)', type: 'number' },
  { key: 'canteen_status', label: 'Canteen Status', type: 'select', options: ['open', 'closed', 'busy'] },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsAPI.get().then(({ data }) => setSettings(data)).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsAPI.update(settings)
      toast.success('Settings saved successfully!')
    } catch { toast.error('Failed to save settings') } finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2"><Settings size={22} className="text-primary-500" /> Application Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure canteen-wide settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 py-2 disabled:opacity-60">
          <Save size={16} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          {SETTING_FIELDS.map(({ key, label, type, options }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              {type === 'select' ? (
                <select value={settings[key] || ''} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} className="input-field text-sm">
                  {options?.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                </select>
              ) : (
                <input type={type} value={settings[key] || ''} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} className="input-field text-sm" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">⚙️ Changes take effect immediately. Tax percentage and packaging charge apply to new orders only.</p>
      </div>
    </div>
  )
}
