import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Store, Clock, FileText, CheckCircle, ArrowLeft } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { ordersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI Payment', sub: 'PhonePe / GPay / Paytm (Simulated)', icon: <Smartphone size={22} /> },
  { id: 'card', label: 'Card Payment', sub: 'Credit / Debit card (Simulated)', icon: <CreditCard size={22} /> },
  { id: 'pay_at_counter', label: 'Pay at Counter', sub: 'Pay cash when collecting your food', icon: <Store size={22} /> },
]

const TAX_PCT = 5
const PKG_CHARGE = 5

function SimulatedPayment({ method, amount, onSuccess, onCancel }) {
  const [step, setStep] = useState(0)
  const [upiId, setUpiId] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiry, setExpiry] = useState('')
  const [processing, setProcessing] = useState(false)

  const handlePay = () => {
    setProcessing(true)
    setStep(1)
    setTimeout(() => { setStep(2); setProcessing(false) }, 2000)
  }

  if (step === 2) return (
    <div className="text-center py-8">
      <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
      <p className="font-bold text-lg text-gray-900">Payment Successful!</p>
      <p className="text-sm text-gray-500 mt-1">₹{amount} paid via {method === 'upi' ? 'UPI' : 'Card'}</p>
      <button onClick={onSuccess} className="btn-primary mt-6 px-8">Place Order</button>
    </div>
  )

  if (step === 1) return (
    <div className="text-center py-10">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-semibold text-gray-700">Processing payment...</p>
      <p className="text-sm text-gray-400 mt-1">Please wait</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center">
        <p className="text-sm text-primary-700 font-semibold">⚠️ This is a simulated payment for demonstration</p>
        <p className="text-2xl font-extrabold text-primary-600 mt-2">₹{amount}</p>
      </div>
      {method === 'upi' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
          <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="input-field" />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
            <input type="text" value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16))} placeholder="1234 5678 9012 3456" className="input-field" maxLength={16} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry</label>
              <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" className="input-field" maxLength={5} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
              <input type="password" value={cvv} onChange={e => setCvv(e.target.value.slice(0,3))} placeholder="•••" className="input-field" maxLength={3} />
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handlePay} disabled={processing || (method === 'upi' ? !upiId : !cardNum || !cvv || !expiry)}
          className="btn-primary flex-1 disabled:opacity-60">
          Pay ₹{amount}
        </button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [notes, setNotes] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const tax = Math.round(subtotal * TAX_PCT / 100 * 100) / 100
  const total = Math.round((subtotal + tax + PKG_CHARGE) * 100) / 100

  if (cart.length === 0) {
    navigate('/student/cart')
    return null
  }

  const placeOrder = async (paid = false) => {
    setLoading(true)
    try {
      const payload = {
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        payment_method: paymentMethod,
        preparation_notes: notes || null,
        is_scheduled: isScheduled,
        scheduled_pickup_time: isScheduled && scheduledTime ? new Date(scheduledTime).toISOString() : null,
      }
      const { data } = await ordersAPI.create(payload)
      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/student/orders/${data.id}/confirmation`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to place order')
    } finally { setLoading(false) }
  }

  const handleProceed = () => {
    if (paymentMethod === 'pay_at_counter') { placeOrder(); return }
    setShowPayment(true)
  }

  if (showPayment) return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-4">{paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}</h2>
        <SimulatedPayment method={paymentMethod} amount={total} onSuccess={() => placeOrder(true)} onCancel={() => setShowPayment(false)} />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to cart
      </button>
      <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

      {/* Order summary */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Order Summary ({cart.length} items)</h3>
        <div className="space-y-2">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name} × {item.quantity}</span>
              <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Packaging</span><span>₹{PKG_CHARGE}</span></div>
            <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span className="text-primary-500">₹{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Pickup time */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Clock size={18} className="text-primary-500" /> Pickup Time</h3>
        <div className="flex gap-3">
          {[false, true].map(sched => (
            <button key={String(sched)} onClick={() => setIsScheduled(sched)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${isScheduled === sched ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {sched ? '🗓️ Schedule pickup' : '⚡ ASAP'}
            </button>
          ))}
        </div>
        {isScheduled && (
          <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="input-field mt-3" min={new Date().toISOString().slice(0,16)} />
        )}
      </div>

      {/* Notes */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FileText size={18} className="text-primary-500" /> Preparation Notes</h3>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Any special requests? e.g. less spicy, extra chutney, no onion..."
          className="input-field resize-none" />
      </div>

      {/* Payment method */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(({ id, label, sub, icon }) => (
            <button key={id} onClick={() => setPaymentMethod(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${paymentMethod === id ? 'bg-primary-50 border-primary-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{icon}</div>
              <div>
                <p className={`font-semibold text-sm ${paymentMethod === id ? 'text-primary-700' : 'text-gray-800'}`}>{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === id ? 'border-primary-500' : 'border-gray-300'}`}>
                {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleProceed} disabled={loading} className="w-full btn-primary py-4 text-base font-bold disabled:opacity-60">
        {loading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing order...</span>
          : paymentMethod === 'pay_at_counter' ? `Place Order · ₹${total.toFixed(2)}` : `Proceed to Pay · ₹${total.toFixed(2)}`}
      </button>
    </div>
  )
}
