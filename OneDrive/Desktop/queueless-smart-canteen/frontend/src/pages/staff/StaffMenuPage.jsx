import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { menuAPI, categoriesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', description: '', category_id: '', price: '', preparation_time: '10', food_type: 'veg', image_url: '', is_available: true, stock_quantity: '50', is_popular: false }

export default function StaffMenuPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = () => Promise.all([
    menuAPI.getAll({}),
    categoriesAPI.getAll(),
  ]).then(([m, c]) => { setItems(m.data); setCategories(c.data) }).finally(() => setLoading(false))

  useEffect(() => { fetchAll() }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (item) => {
    setForm({ ...item, category_id: item.category_id, price: String(item.price), preparation_time: String(item.preparation_time), stock_quantity: String(item.stock_quantity) })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), preparation_time: parseInt(form.preparation_time), category_id: parseInt(form.category_id), stock_quantity: parseInt(form.stock_quantity) }
      if (editId) await menuAPI.update(editId, payload)
      else await menuAPI.create(payload)
      toast.success(editId ? 'Menu item updated' : 'Menu item added')
      setShowForm(false)
      fetchAll()
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to save') } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try { await menuAPI.delete(id); toast.success('Deleted'); fetchAll() } catch { toast.error('Failed to delete') }
  }

  const handleToggle = async (id) => {
    try { await menuAPI.toggleAvailability(id); fetchAll() } catch { toast.error('Failed') }
  }

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">Menu Management</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..." className="input-field pl-9 text-sm py-2.5" />
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900">{editId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input required value={form.name} onChange={e => set('name', e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required value={form.category_id} onChange={e => set('category_id', e.target.value)} className="input-field text-sm">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                  <select value={form.food_type} onChange={e => set('food_type', e.target.value)} className="input-field text-sm">
                    <option value="veg">Vegetarian</option>
                    <option value="non_veg">Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="1" step="0.5" value={form.price} onChange={e => set('price', e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input type="number" min="1" max="60" value={form.preparation_time} onChange={e => set('preparation_time', e.target.value)} className="input-field text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." className="input-field text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className="input-field text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                  <input type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} className="input-field text-sm" />
                </div>
                <div className="flex flex-col gap-2 justify-end">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.is_popular} onChange={e => set('is_popular', e.target.checked)} className="w-4 h-4 accent-primary-500" />
                    Popular item
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} className="w-4 h-4 accent-primary-500" />
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className={`card p-4 ${!item.is_available ? 'opacity-60' : ''}`}>
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://via.placeholder.com/56/f97316/ffffff?text=${item.name[0]}` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary-500 text-sm">₹{item.price}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.food_type === 'veg' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{item.food_type === 'veg' ? 'V' : 'NV'}</span>
                    <span className="text-xs text-gray-400">Stock: {item.stock_quantity}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                <button onClick={() => handleToggle(item.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${item.is_available ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                  {item.is_available ? '✅ Available' : '❌ Unavailable'}
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-all">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
