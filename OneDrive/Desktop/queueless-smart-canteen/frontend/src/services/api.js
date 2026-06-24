import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cb_token')
      localStorage.removeItem('cb_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.put('/api/auth/change-password', data),
}

// ─── Menu ────────────────────────────────────────────────────────────────────
export const menuAPI = {
  getAll: (params) => api.get('/api/menu', { params }),
  getOne: (id) => api.get(`/api/menu/${id}`),
  create: (data) => api.post('/api/menu', data),
  update: (id, data) => api.put(`/api/menu/${id}`, data),
  delete: (id) => api.delete(`/api/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/api/menu/${id}/availability`),
}

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/api/orders', data),
  myOrders: () => api.get('/api/orders/my-orders'),
  getOne: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.patch(`/api/orders/${id}/cancel`),
  updateStatus: (id, data) => api.patch(`/api/orders/${id}/status`, data),
  getActive: () => api.get('/api/orders/active'),
  getStaffOrders: (status) => api.get('/api/orders/staff', { params: { status } }),
  verifyPickup: (id, data) => api.post(`/api/orders/${id}/verify-pickup`, data),
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  dashboard: () => api.get('/api/analytics/dashboard'),
  sales: (days) => api.get('/api/analytics/sales', { params: { days } }),
  popularItems: (limit) => api.get('/api/analytics/popular-items', { params: { limit } }),
  peakHours: () => api.get('/api/analytics/peak-hours'),
  monthlyRevenue: () => api.get('/api/analytics/monthly-revenue'),
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (data) => api.put('/api/settings', data),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: (role) => api.get('/api/admin/users', { params: { role } }),
  toggleActive: (id) => api.patch(`/api/admin/users/${id}/toggle-active`),
  createStaff: (data) => api.post('/api/admin/staff', data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
}
