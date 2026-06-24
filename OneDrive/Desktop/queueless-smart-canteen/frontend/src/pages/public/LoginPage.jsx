import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLE_CONFIG = {
  student: { title: 'Student Login', subtitle: 'Order food without the queue', demo: 'student@campusbite.com / Student@123', redirect: '/student' },
  staff:   { title: 'Staff Login',   subtitle: 'Manage kitchen orders',         demo: 'staff@campusbite.com / Staff@123',   redirect: '/staff' },
  admin:   { title: 'Admin Login',   subtitle: 'Full canteen control panel',    demo: 'admin@campusbite.com / Admin@123',   redirect: '/admin' },
}

export default function LoginPage({ defaultRole = 'student' }) {
  const [role, setRole] = useState(defaultRole)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const config = ROLE_CONFIG[role]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const user = await login(identifier, password)
      toast.success('Welcome back, ' + user.full_name + '!')
      const redirectMap = { student: '/student', staff: '/staff', admin: '/admin' }
      navigate(redirectMap[user.role] || '/')
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach the server. Make sure the backend is running on port 8000.', { duration: 6000 })
      } else {
        toast.error(err?.response?.data?.detail || 'Invalid credentials. Check your email and password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    const [email, pwd] = config.demo.split(' / ')
    setIdentifier(email)
    setPassword(pwd)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex w-1/2 hero-gradient flex-col justify-center px-16 text-white">
        <Link to="/" className="flex items-center gap-2 mb-16 opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-2xl">&#x1F35B;</span>
          <span className="text-xl font-bold">CampusBite</span>
        </Link>
        <h2 className="text-4xl font-extrabold mb-4 leading-tight">
          Skip the billing queue.<br />
          <span className="text-primary-400">Collect food when ready.</span>
        </h2>
        <p className="text-blue-200 text-lg mb-8">
          Browse the menu, place your order and track preparation in real time.
        </p>
        <div className="space-y-3">
          {[
            'Order from your phone anywhere on campus',
            'Live order tracking — Placed to Preparing to Ready',
            'Secure QR code pickup at the counter',
            'No billing queue ever again',
          ].map(function(f) {
            return (
              <div key={f} className="flex items-center gap-3 text-blue-100">
                <span className="text-primary-400 font-bold">&#10003;</span>{f}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>

          {defaultRole === 'student' && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
              {Object.entries(ROLE_CONFIG).map(function([r]) {
                return (
                  <button key={r} onClick={() => setRole(r)}
                    className={'flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ' +
                      (role === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
                    {r}
                  </button>
                )
              })}
            </div>
          )}

          <div className="card p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{config.title}</h1>
            <p className="text-gray-500 text-sm mb-6">{config.subtitle}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">Demo credentials</p>
                <p className="text-xs text-amber-600 font-mono">{config.demo}</p>
              </div>
              <button onClick={fillDemo}
                className="text-xs text-amber-700 font-semibold hover:text-amber-900 whitespace-nowrap border border-amber-300 px-2 py-1 rounded-lg hover:bg-amber-100 transition-all">
                Auto-fill
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {role === 'student' ? 'Email or Register Number' : 'Email Address'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={function(e) { setIdentifier(e.target.value) }}
                  placeholder={role === 'student' ? 'email@college.edu or 21CS001' : 'email@campusbite.com'}
                  className="input-field"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={function(e) { setPassword(e.target.value) }}
                    placeholder="Enter your password"
                    className="input-field pr-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={function() { setShowPwd(!showPwd) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {role === 'student' && (
              <p className="text-center text-sm text-gray-500 mt-5">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-500 font-semibold hover:text-primary-600">
                  Register here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
