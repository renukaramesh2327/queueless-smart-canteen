import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cb_cart')) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cb_cart', JSON.stringify(cart))
  }, [cart])

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) { removeItem(id); return }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => setCart([])

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
