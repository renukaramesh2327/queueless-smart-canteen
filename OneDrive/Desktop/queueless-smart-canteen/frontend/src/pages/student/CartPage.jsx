import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const TAX_PCT = 5
const PKG_CHARGE = 5

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, subtotal } = useCart()
  const tax = Math.round(subtotal * TAX_PCT / 100 * 100) / 100
  const total = Math.round((subtotal + tax + PKG_CHARGE) * 100) / 100

  if (cart.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ShoppingBag size={64} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 text-sm mb-6">Add items from the menu to get started</p>
      <Link to="/student/menu" className="btn-primary">Browse Menu</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Your Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-500 font-medium flex items-center gap-1">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="space-y-3">
        {cart.map(item => (
          <div key={item.id} className="card p-4 flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://via.placeholder.com/64x64/f97316/ffffff?text=${item.name[0]}` }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{item.food_type?.replace('_', '-')}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                  <button onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100">
                    <Minus size={13} />
                  </button>
                  <span className="w-5 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 shadow-sm">
                    <Plus size={13} />
                  </button>
                </div>
                <span className="font-bold text-primary-500">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bill summary */}
      <div className="card p-5 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag size={16} className="text-primary-500" /> Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>GST ({TAX_PCT}%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Packaging charge</span><span>₹{PKG_CHARGE.toFixed(2)}</span></div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
            <span>Grand Total</span><span className="text-primary-500">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/student/menu" className="btn-secondary flex-1 text-center">Continue Shopping</Link>
        <Link to="/student/checkout" className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
          Checkout <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
