'use client'

import { useState, useEffect } from 'react'
import { MenuItem, Category } from '@/lib/types'
import { getCategories, getMenuItems } from '@/lib/db'
import { MenuItemCard } from '@/components/menu-item-card'
import { CategoryTabs } from '@/components/category-tabs'
import { CartButton } from '@/components/cart-button'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import { UtensilsCrossed } from 'lucide-react'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const [categoriesData, itemsData] = await Promise.all([
        getCategories(),
        getMenuItems(),
      ])
      setCategories(categoriesData)
      setMenuItems(itemsData)
    }
    loadData()
  }, [])

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category_id === activeCategory)

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item)
  }

  const handleViewCart = () => {
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Delicious Bites</h1>
              <p className="text-sm text-muted-foreground">Fresh food, delivered fast</p>
            </div>
          </div>
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Featured Items */}
        {activeCategory === 'all' && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Dishes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems
                .filter((item) => item.is_featured)
                .map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
            </div>
          </section>
        )}

        {/* All Menu Items */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {activeCategory === 'all'
              ? 'All Items'
              : categories.find((c) => c.id === activeCategory)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No items found in this category.
            </div>
          )}
        </section>
      </main>

      {/* Cart Button */}
      <CartButton onClick={handleViewCart} />
    </div>
  )
}
