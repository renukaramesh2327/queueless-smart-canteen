import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Electrical','Mechanical','Civil','Chemical','Biotechnology','MBA','MCA','Other']
const YEARS = [1, 2, 3, 4, 5]

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', register_number: '', email: '', department: '', study_year: '', phone: '', password: '', confirm_password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register({ ...form, study_year: form.study_year ? parseInt(form.study_year) : null })
      toast.success('Account created! Welcome to CampusBite 🎉')
      navigate('/student')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🍛</span>
            <span className="text-2xl font-bold gradient-text">CampusBite</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Create Student Account</h1>
          <p className="text-gray-500 mt-1">Join your campus and start ordering smarter</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Your full name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Register Number</label>
                <input type="text" value={form.register_number} onChange={e => set('register_number', e.target.value)}
                  placeholder="e.g. 21CS001" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College Email *</label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@college.edu" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="10-digit mobile number" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <select value={form.department} onChange={e => set('department', e.target.value)} className="input-field">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Year of Study</label>
                <select value={form.study_year} onChange={e => set('study_year', e.target.value)} className="input-field">
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={form.password}
                    onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" className="input-field pr-11" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={form.confirm_password}
                    onChange={e => set('confirm_password', e.target.value)} placeholder="Re-enter password" className="input-field pr-11" />
                  {form.confirm_password && (
                    <CheckCircle size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${form.password === form.confirm_password ? 'text-green-500' : 'text-red-400'}`} />
                  )}
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base disabled:opacity-60">
              {loading ? <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </span> : 'Create Account & Start Ordering 🚀'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
