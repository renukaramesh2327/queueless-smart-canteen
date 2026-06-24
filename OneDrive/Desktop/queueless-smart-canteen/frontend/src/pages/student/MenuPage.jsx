import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Plus, Minus, ShoppingCart, Clock, Star, X, SlidersHorizontal } from 'lucide-react'
import { menuAPI, categoriesAPI } from '../../services/api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '')
  const [foodType, setFoodType] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [maxPrice, setMaxPrice] = useState(500)
  const { cart, addItem, removeItem, updateQuantity } = useCart()
  const searchRef = useRef(null)

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data)).catch(() => {})
    fetchMenu()
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchMenu, 400)
    return () => clearTimeout(timer)
  }, [search, selectedCat, foodType, maxPrice])

  const fetchMenu = () => {
    setLoading(true)
    const params = { available_only: true }
    if (search) params.search = search
    if (selectedCat) {
      const cat = categories.find(c => c.name === selectedCat)
      if (cat) params.category_id = cat.id
    }
    if (foodType) params.food_type = foodType
    if (maxPrice < 500) params.max_price = maxPrice
    menuAPI.getAll(params)
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const getCartQty = (id) => cart.find(i => i.id === id)?.quantity || 0

  const handleAdd = (item) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, food_type: item.food_type })
    toast.success(`${item.name} added to cart`, { icon: '🛒', duration: 1500 })
  }

  const groupedItems = {}
  items.forEach(item => {
    const catName = item.category?.name || 'Other'
    if (!groupedItems[catName]) groupedItems[catName] = []
    groupedItems[catName].push(item)
  })

  return (
    <div className="space-y-5">
      {/* Search + Filter row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes..." className="input-field pl-11 py-3" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <SlidersHorizontal size={18} /> Filter
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700 w-full">Food Type</span>
            {[['', 'All'], ['veg', '🟢 Veg'], ['non_veg', '🔴 Non-Veg']].map(([val, label]) => (
              <button key={val} onClick={() => setFoodType(val)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${foodType === val ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                {label}
              </button>
            ))}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">Max Price: ₹{maxPrice === 500 ? 'Any' : maxPrice}</span>
            <input type="range" min={20} max={500} step={10} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full mt-2 accent-primary-500" />
          </div>
          <button onClick={() => { setFoodType(''); setMaxPrice(500); setSelectedCat('') }}
            className="text-sm text-red-500 hover:text-red-600 font-medium">Clear all filters</button>
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <CategoryChip label="All" selected={!selectedCat} onClick={() => setSelectedCat('')} />
        {categories.map(cat => (
          <CategoryChip key={cat.id} label={cat.name} selected={selectedCat === cat.name} onClick={() => setSelectedCat(selectedCat === cat.name ? '' : cat.name)} />
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🍽️</span>
          <p className="text-lg font-bold text-gray-700">No items found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : selectedCat ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => <FoodCard key={item.id} item={item} qty={getCartQty(item.id)} onAdd={handleAdd} onUpdate={updateQuantity} onRemove={removeItem} />)}
        </div>
      ) : (
        Object.entries(groupedItems).map(([catName, catItems]) => (
          <div key={catName}>
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full" />{catName}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catItems.map(item => <FoodCard key={item.id} item={item} qty={getCartQty(item.id)} onAdd={handleAdd} onUpdate={updateQuantity} onRemove={removeItem} />)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function CategoryChip({ label, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selected ? 'bg-primary-500 text-white border-primary-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'}`}>
      {label}
    </button>
  )
}

function FoodCard({ item, qty, onAdd, onUpdate, onRemove }) {
  return (
    <div className="food-card overflow-hidden">
      <div className="relative h-44 bg-gray-100">
        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://via.placeholder.com/280x176/f97316/ffffff?text=${encodeURIComponent(item.name[0])}` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-2 left-2 ${item.food_type === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
          {item.food_type === 'veg' ? 'Veg' : 'Non-Veg'}
        </span>
        {item.is_popular && (
          <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">🔥 Popular</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" />{item.rating}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{item.preparation_time}m prep</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-extrabold text-primary-500">₹{item.price}</span>
          {qty === 0 ? (
            <button onClick={() => onAdd(item)}
              className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm">
              <Plus size={16} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-primary-50 rounded-xl p-1">
              <button onClick={() => qty === 1 ? onRemove(item.id) : onUpdate(item.id, qty - 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-primary-700">{qty}</span>
              <button onClick={() => onUpdate(item.id, qty + 1)}
                className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors shadow-sm">
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
