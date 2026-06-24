import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const navItems = [
  { to: '/student', label: 'Home', icon: Home, end: true },
  { to: '/student/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/student/cart', label: 'Cart', icon: ShoppingCart, badge: true },
  { to: '/student/orders', label: 'Orders', icon: ClipboardList },
  { to: '/student/profile', label: 'Profile', icon: User },
]

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-40 shadow-sm">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍛</span>
          <span className="text-xl font-bold gradient-text">CampusBite</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative
                ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`
              }>
              <Icon size={18} />
              {label}
              {badge && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">{user?.full_name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-xl">🍛</span>
          <span className="text-lg font-bold gradient-text">CampusBite</span>
        </NavLink>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-40 shadow-lg">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 relative transition-colors
              ${isActive ? 'text-primary-600' : 'text-gray-400'}`
            }>
            <div className="relative">
              <Icon size={22} />
              {badge && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
