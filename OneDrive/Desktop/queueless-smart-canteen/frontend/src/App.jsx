import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Public pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import AboutPage from './pages/public/AboutPage'

// Student pages
import StudentLayout from './layouts/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import MenuPage from './pages/student/MenuPage'
import CartPage from './pages/student/CartPage'
import CheckoutPage from './pages/student/CheckoutPage'
import OrderConfirmationPage from './pages/student/OrderConfirmationPage'
import OrderTrackingPage from './pages/student/OrderTrackingPage'
import OrderHistoryPage from './pages/student/OrderHistoryPage'
import ProfilePage from './pages/student/ProfilePage'

// Staff pages
import StaffLayout from './layouts/StaffLayout'
import StaffDashboard from './pages/staff/StaffDashboard'
import KitchenBoardPage from './pages/staff/KitchenBoardPage'
import StaffMenuPage from './pages/staff/StaffMenuPage'
import StaffOrdersPage from './pages/staff/StaffOrdersPage'
import QRVerifyPage from './pages/staff/QRVerifyPage'
import StockPage from './pages/staff/StockPage'

// Admin pages
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagementPage from './pages/admin/UserManagementPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import ReportsPage from './pages/admin/ReportsPage'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/staff/login" element={<LoginPage defaultRole="staff" />} />
      <Route path="/admin/login" element={<LoginPage defaultRole="admin" />} />

      {/* Student */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="orders/:id/confirmation" element={<OrderConfirmationPage />} />
        <Route path="orders/:id/track" element={<OrderTrackingPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Staff */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['staff', 'admin']}>
          <StaffLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="kitchen" element={<KitchenBoardPage />} />
        <Route path="orders" element={<StaffOrdersPage />} />
        <Route path="menu" element={<StaffMenuPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="verify" element={<QRVerifyPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
