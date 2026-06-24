import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Clock, QrCode, ChevronRight, Star, Users, Zap, CheckCircle, ChefHat, Smartphone, ArrowRight, Menu, X } from 'lucide-react'
import { ordersAPI, menuAPI } from '../../services/api'

const STEPS = [
  { icon: '🍽️', title: 'Browse the Menu', desc: 'Explore all dishes with photos, prices, and prep times. Filter by category, veg/non-veg, or search by name.' },
  { icon: '💳', title: 'Place & Pay', desc: 'Add items to your cart, choose a pickup time, and pay via UPI, card, or pay at counter.' },
  { icon: '📲', title: 'Track Preparation', desc: 'Watch your order move from Placed → Accepted → Preparing → Ready in real time.' },
  { icon: '📦', title: 'Scan QR & Collect', desc: 'Show your QR code at the pickup counter. Staff scans it and hands you your food. No waiting in billing lines!' },
]

const BENEFITS = [
  { icon: '⚡', title: 'Skip the Billing Queue', desc: 'Never stand in the cashier line again. Order and pay digitally before you even enter the canteen.' },
  { icon: '🎯', title: 'Accurate Orders', desc: 'No miscommunication. Your exact order with special notes goes directly to the kitchen.' },
  { icon: '⏱️', title: 'Live Wait Time', desc: 'Know exactly how long your food will take based on current kitchen activity.' },
  { icon: '📋', title: 'Order History', desc: 'Reorder your favourite meals in one tap. Review all past orders and download receipts.' },
  { icon: '🔔', title: 'Pickup Alerts', desc: 'Get notified the moment your food is ready so you come at exactly the right time.' },
  { icon: '🛡️', title: 'Secure QR Pickup', desc: 'Each order has a unique QR code. Only you can collect your food — no mix-ups.' },
]

const TESTIMONIALS = [
  { name: 'Arun Raj', dept: 'Computer Science, 3rd Year', text: 'I used to waste 20 minutes every lunch break in the billing queue. CampusBite saves my entire break now. I order from class and collect on the way!', rating: 5 },
  { name: 'Divya Menon', dept: 'Electronics, 2nd Year', text: 'The live tracking is amazing. I can see exactly when my food is ready and walk in at the perfect time. No more cold food waiting!', rating: 5 },
  { name: 'Karthik Selvam', dept: 'Mechanical, 4th Year', text: 'As a final year student, my time is precious. This app is a game changer. The QR pickup is seamless and super fast.', rating: 5 },
]

const FAQS = [
  { q: 'Is the payment secure?', a: 'Yes. We use simulated UPI and card payment for demonstration. In production, real payment gateways (Razorpay/Stripe) with full encryption will be integrated.' },
  { q: 'What if I want to cancel my order?', a: 'You can cancel your order within the configured cancellation window (default 5 minutes after placing) from your order history page.' },
  { q: 'How does QR pickup work?', a: 'After placing an order, you receive a unique QR code. When your order is ready, show this QR at the pickup counter. Staff scans it to verify and hand over your food.' },
  { q: 'What if I forget my QR code?', a: 'No worries! You also get a 4-digit pickup token that staff can enter manually as a fallback.' },
  { q: 'Can I schedule a pickup time?', a: 'Yes! During checkout you can select "As soon as possible" or choose a scheduled pickup time that suits your class schedule.' },
]

export default function LandingPage() {
  const [queueStatus, setQueueStatus] = useState(null)
  const [popularItems, setPopularItems] = useState([])
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    ordersAPI.getActive().then(({ data }) => setQueueStatus(data)).catch(() => {})
    menuAPI.getAll({ popular_only: true, available_only: true }).then(({ data }) => setPopularItems(data.slice(0, 6))).catch(() => {})
  }, [])

  const queueColor = { low: 'text-green-600 bg-green-50', moderate: 'text-yellow-600 bg-yellow-50', busy: 'text-orange-600 bg-orange-50', very_busy: 'text-red-600 bg-red-50' }
  const queueLabel = { low: '🟢 Low Queue', moderate: '🟡 Moderate', busy: '🟠 Busy', very_busy: '🔴 Very Busy' }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍛</span>
            <span className="text-xl font-bold gradient-text">CampusBite</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">How It Works</a>
            <a href="#menu" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">Menu</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">FAQ</a>
            <Link to="/staff/login" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">Staff Login</Link>
            <Link to="/login" className="btn-primary text-sm py-2">Order Food</Link>
          </div>
          <button className="md:hidden" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            <a href="#how-it-works" className="text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>How It Works</a>
            <a href="#menu" className="text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>Menu</a>
            <a href="#faq" className="text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>FAQ</a>
            <Link to="/staff/login" className="text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>Staff Login</Link>
            <Link to="/login" className="btn-primary text-center" onClick={() => setNavOpen(false)}>Order Food</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap size={14} className="text-primary-400" />
              Smart Canteen Technology
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your College Canteen,<br />
              <span className="text-primary-400">Without the Queue</span>
            </h1>
            <p className="text-lg text-blue-200 mb-8 max-w-xl">
              Browse the menu, place your order, track its preparation and collect your food using a secure QR pickup token. Skip the billing queue and eat on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary-500/25 active:scale-95">
                <ShoppingBag size={22} /> Order Food Now
              </Link>
              <Link to="/staff/login" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all border border-white/20">
                <ChefHat size={22} /> Staff Login
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-blue-300">
              <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-400" /> Free to use</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-400" /> Mobile friendly</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-400" /> Secure QR pickup</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">🍛</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Order #CB-001</p>
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" /> Ready for Pickup!
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {['Masala Dosa × 1', 'Filter Coffee × 2', 'Samosa × 2'].map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Your pickup token</p>
                    <p className="text-3xl font-extrabold text-primary-500 tracking-widest">7284</p>
                    <p className="text-xs text-gray-400 mt-1">Counter #2</p>
                  </div>
                </div>
                {/* Queue status */}
                {queueStatus && (
                  <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${queueColor[queueStatus.level] || 'bg-gray-50 text-gray-700'}`}>
                    <span className="block font-bold">{queueLabel[queueStatus.level] || 'Live Queue'}</span>
                    <span>~{queueStatus.estimated_wait_minutes} min wait · {queueStatus.active_orders} active orders</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '20+', label: 'Menu Items', icon: '🍽️' },
            { value: '3 sec', label: 'Avg. Checkout Time', icon: '⚡' },
            { value: '0 min', label: 'Billing Wait', icon: '⏱️' },
            { value: '100%', label: 'Mobile Friendly', icon: '📱' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="p-4">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-3xl font-extrabold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How CampusBite Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Four simple steps to skip the queue and get your food on time</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">Step {i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular items */}
      <section id="menu" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Popular Right Now</h2>
              <p className="text-gray-500">Most ordered items this week</p>
            </div>
            <Link to="/student/menu" className="hidden sm:flex items-center gap-1.5 text-primary-500 font-semibold hover:text-primary-600 text-sm">
              View Full Menu <ArrowRight size={16} />
            </Link>
          </div>
          {popularItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularItems.map(item => (
                <div key={item.id} className="food-card overflow-hidden flex">
                  <img src={item.image_url} alt={item.name} className="w-28 h-28 object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/112x112/f97316/ffffff?text=${encodeURIComponent(item.name[0])}` }} />
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={item.food_type === 'veg' ? 'badge-veg' : 'badge-nonveg'}>
                          <span className={`w-2 h-2 rounded-full ${item.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {item.food_type === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-500">{item.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary-500">₹{item.price}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{item.preparation_time}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-28 skeleton" />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag size={18} /> Start Ordering <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Why Students Love CampusBite</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built to solve the real problems students face every lunch break</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">What Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, dept, text, rating }) => (
              <div key={name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rating)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{dept}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Skip the Queue?</h2>
          <p className="text-lg text-blue-200 mb-8">Join your classmates and start ordering smarter today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all">
              Create Free Account <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg border border-white/20 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍛</span>
              <span className="text-lg font-bold text-white">CampusBite</span>
              <span className="text-gray-500 text-sm ml-2">Skip the Queue. Order Smart. Eat on Time.</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/staff/login" className="hover:text-white transition-colors">Staff Login</Link>
              <Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} CampusBite. Built for college hackathon demonstration purposes.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}>
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <ChevronRight size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>}
    </div>
  )
}
