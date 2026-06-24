import { useState, useEffect } from 'react'
import { Search, Plus, UserCheck, UserX, Trash2, X } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [staffForm, setStaffForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'staff' })
  const [saving, setSaving] = useState(false)

  const fetchUsers = () => adminAPI.getUsers(roleFilter !== 'all' ? roleFilter : null)
    .then(({ data }) => setUsers(data)).finally(() => setLoading(false))

  useEffect(() => { fetchUsers() }, [roleFilter])

  const handleToggle = async (id, name) => {
    try { await adminAPI.toggleActive(id); toast.success(`${name}'s account updated`); fetchUsers() }
    catch (err) { toast.error(err?.response?.data?.detail || 'Failed') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    try { await adminAPI.deleteUser(id); toast.success(`${name} deleted`); fetchUsers() }
    catch { toast.error('Failed to delete') }
  }

  const handleAddStaff = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.createStaff(staffForm)
      toast.success('Staff account created!')
      setShowAddStaff(false)
      setStaffForm({ full_name: '', email: '', phone: '', password: '', role: 'staff' })
      fetchUsers()
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed') } finally { setSaving(false) }
  }

  const filtered = users.filter(u => !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.register_number?.includes(search))

  const ROLE_BADGE = { student: 'bg-blue-100 text-blue-700', staff: 'bg-indigo-100 text-indigo-700', admin: 'bg-purple-100 text-purple-700' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">User Management</h1>
        <button onClick={() => setShowAddStaff(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, register number..." className="input-field pl-9 text-sm py-2.5" />
        </div>
        <div className="flex gap-1">
          {['all','student','staff','admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all border ${roleFilter === r ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Add staff modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddStaff(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900">Add Staff Account</h2>
              <button onClick={() => setShowAddStaff(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddStaff} className="p-5 space-y-4">
              {[
                { key: 'full_name', label: 'Full Name', type: 'text', required: true },
                { key: 'email', label: 'Email', type: 'email', required: true },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'password', label: 'Password', type: 'password', required: true },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} required={required} value={staffForm[key]}
                    onChange={e => setStaffForm(p => ({ ...p, [key]: e.target.value }))} className="input-field text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={staffForm.role} onChange={e => setStaffForm(p => ({ ...p, role: e.target.value }))} className="input-field text-sm">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddStaff(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User','Role','Register No.','Department','Joined','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">{user.full_name[0]}</div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[user.role]}`}>{user.role}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.register_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.department || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {user.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleToggle(user.id, user.full_name)}
                          className={`p-1.5 rounded-lg transition-all ${user.is_active ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'}`}>
                          {user.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button onClick={() => handleDelete(user.id, user.full_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No users found</div>}
          </div>
        </div>
      )}
    </div>
  )
}
