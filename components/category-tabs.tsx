'use client'

import { Category } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 h-auto gap-2">
        <TabsTrigger value="all" className="py-3">
          All Items
        </TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id} className="py-3">
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
