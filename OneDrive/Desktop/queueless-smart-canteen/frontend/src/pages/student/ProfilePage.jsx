import { useState } from 'react'
import { User, Phone, Building, GraduationCap, Lock, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', department: user?.department || '', study_year: user?.study_year || '' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [loading, setLoading] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await authAPI.updateProfile({ ...form, study_year: form.study_year ? parseInt(form.study_year) : null })
      updateUser(data)
      setEditMode(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') } finally { setLoading(false) }
  }

  const handlePwdChange = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm_new_password) { toast.error('Passwords do not match'); return }
    setPwdLoading(true)
    try {
      await authAPI.changePassword(pwdForm)
      toast.success('Password changed!')
      setPwdForm({ current_password: '', new_password: '', confirm_new_password: '' })
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to change password') } finally { setPwdLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-extrabold">{user?.full_name?.[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{user?.full_name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-semibold capitalize">{user?.role}</span>
            </div>
          </div>
          <button onClick={() => setEditMode(!editMode)} className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${editMode ? 'text-gray-500 hover:bg-gray-100' : 'text-primary-500 hover:bg-primary-50'}`}>
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <ProfileField icon={<User size={16} />} label="Full Name">
              <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="input-field text-sm py-2" />
            </ProfileField>
            <ProfileField icon={<Phone size={16} />} label="Phone">
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field text-sm py-2" placeholder="Phone number" />
            </ProfileField>
            <ProfileField icon={<Building size={16} />} label="Department">
              <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="input-field text-sm py-2" placeholder="Department" />
            </ProfileField>
            <ProfileField icon={<GraduationCap size={16} />} label="Year">
              <input type="number" min={1} max={5} value={form.study_year} onChange={e => setForm(p => ({ ...p, study_year: e.target.value }))} className="input-field text-sm py-2 w-24" />
            </ProfileField>
            <button onClick={handleSave} disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={<User size={15} />} label="Register No." value={user?.register_number || '—'} />
            <InfoItem icon={<Phone size={15} />} label="Phone" value={user?.phone || '—'} />
            <InfoItem icon={<Building size={15} />} label="Department" value={user?.department || '—'} />
            <InfoItem icon={<GraduationCap size={15} />} label="Year" value={user?.study_year ? `Year ${user.study_year}` : '—'} />
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock size={18} className="text-primary-500" /> Change Password</h3>
        <form onSubmit={handlePwdChange} className="space-y-3">
          {[
            { key: 'current_password', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'new_password', label: 'New Password', placeholder: 'Min. 6 characters' },
            { key: 'confirm_new_password', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" value={pwdForm[key]} onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder} className="input-field text-sm py-2.5" required />
            </div>
          ))}
          <button type="submit" disabled={pwdLoading} className="btn-primary py-2.5 px-6 disabled:opacity-60">
            {pwdLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function ProfileField({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-3">{icon}</span>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        {children}
      </div>
    </div>
  )
}
