'use client'

import { useState, useEffect } from 'react'
import { MenuItem, Category, Inventory, ItemInventoryMapping } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, ArrowLeft, Package2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/image-upload'

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemMappings, setItemMappings] = useState<ItemInventoryMapping[]>([])
  const [addMappingMode, setAddMappingMode] = useState(false)
  const [newMapping, setNewMapping] = useState({
    inventory_id: '',
    quantity_required: ''
  })
  const [mappingCounts, setMappingCounts] = useState<Record<string, number>>({})
  
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
    is_featured: false,
    stock_quantity: '100',
    display_order: '0',
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [itemsRes, categoriesRes, inventoryRes, mappingsRes] = await Promise.all([
        supabase.from('items').select('*').order('display_order'),
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('inventory').select('*').order('name'),
        supabase.from('item_inventory_mapping').select('item_id'),
      ])

      if (itemsRes.data) setMenuItems(itemsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (inventoryRes.data) setInventory(inventoryRes.data)
      
      // Count mappings per item
      if (mappingsRes.data) {
        const counts: Record<string, number> = {}
        mappingsRes.data.forEach((mapping) => {
          counts[mapping.item_id] = (counts[mapping.item_id] || 0) + 1
        })
        setMappingCounts(counts)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category_id: formData.category_id || null,
            image_url: formData.image_url || null,
            is_available: formData.is_available,
            is_featured: formData.is_featured,
            stock_quantity: parseInt(formData.stock_quantity),
            display_order: parseInt(formData.display_order),
          },
        ])
        .select()

      if (error) throw error
      if (data) {
        setMenuItems([...menuItems, data[0]])
        setAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  const handleUpdateItem = async () => {
    if (!selectedItem) return

    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id || null,
          image_url: formData.image_url || null,
          is_available: formData.is_available,
          is_featured: formData.is_featured,
          stock_quantity: parseInt(formData.stock_quantity),
          display_order: parseInt(formData.display_order),
        })
        .eq('id', selectedItem.id)

      if (error) throw error

      setMenuItems(
        menuItems.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category_id: formData.category_id || null,
                image_url: formData.image_url || null,
                is_available: formData.is_available,
                is_featured: formData.is_featured,
                stock_quantity: parseInt(formData.stock_quantity),
                display_order: parseInt(formData.display_order),
              }
            : item
        )
      )
      setEditDialogOpen(false)
      setSelectedItem(null)
      resetForm()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
      setMenuItems(menuItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_featured: item.is_featured,
      stock_quantity: item.stock_quantity.toString(),
      display_order: item.display_order.toString(),
    })
    setEditDialogOpen(true)
  }

  const openMappingDialog = async (item: MenuItem) => {
    setSelectedItem(item)
    setAddMappingMode(false)
    setNewMapping({ inventory_id: '', quantity_required: '' })
    try {
      const { data, error } = await supabase
        .from('item_inventory_mapping')
        .select('*, inventory(*)')
        .eq('item_id', item.id)

      if (error) throw error
      setItemMappings(data || [])
      setMappingDialogOpen(true)
    } catch (error) {
      console.error('Error loading mappings:', error)
    }
  }

  const handleAddMapping = async () => {
    if (!selectedItem || !newMapping.inventory_id || !newMapping.quantity_required) {
      alert('Please select an inventory item and enter quantity')
      return
    }

    // Check if mapping already exists
    const existingMapping = itemMappings.find(
      (m) => m.inventory_id === newMapping.inventory_id
    )
    if (existingMapping) {
      alert('This inventory item is already mapped to this menu item')
      return
    }

    try {
      const { data, error } = await supabase
        .from('item_inventory_mapping')
        .insert([
          {
            item_id: selectedItem.id,
            inventory_id: newMapping.inventory_id,
            quantity_required: parseFloat(newMapping.quantity_required),
          },
        ])
        .select('*, inventory(*)')
        .single()

      if (error) throw error
      if (data) {
        setItemMappings([...itemMappings, data])
        setNewMapping({ inventory_id: '', quantity_required: '' })
        setAddMappingMode(false)
        // Update mapping count
        if (selectedItem) {
          setMappingCounts({
            ...mappingCounts,
            [selectedItem.id]: (mappingCounts[selectedItem.id] || 0) + 1
          })
        }
      }
    } catch (error) {
      console.error('Error adding mapping:', error)
      alert('Failed to add inventory mapping')
    }
  }

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('Are you sure you want to remove this inventory mapping?')) return

    try {
      const { error } = await supabase
        .from('item_inventory_mapping')
        .delete()
        .eq('id', mappingId)

      if (error) throw error
      setItemMappings(itemMappings.filter((m) => m.id !== mappingId))
      // Update mapping count
      if (selectedItem) {
        setMappingCounts({
          ...mappingCounts,
          [selectedItem.id]: Math.max(0, (mappingCounts[selectedItem.id] || 0) - 1)
        })
      }
    } catch (error) {
      console.error('Error deleting mapping:', error)
      alert('Failed to delete inventory mapping')
    }
  }

  const handleUpdateMapping = async (mappingId: string, newQuantity: string) => {
    const quantity = parseFloat(newQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    try {
      const { error } = await supabase
        .from('item_inventory_mapping')
        .update({ quantity_required: quantity })
        .eq('id', mappingId)

      if (error) throw error

      setItemMappings(
        itemMappings.map((m) =>
          m.id === mappingId ? { ...m, quantity_required: quantity } : m
        )
      )
    } catch (error) {
      console.error('Error updating mapping:', error)
      alert('Failed to update inventory mapping')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true,
      is_featured: false,
      stock_quantity: '100',
      display_order: '0',
    })
  }

  const getCategoryName = (categoryId: string | null) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
              <p className="text-muted-foreground">Manage menu items and inventory mappings</p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <Card className="mb-6 border-blue-500/50 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Package2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Manage Inventory Mappings</p>
                <p className="text-sm text-muted-foreground">
                  Click the <strong className="text-foreground">"Inventory"</strong> button on any menu item to map raw ingredients. 
                  When orders are completed, inventory will automatically deduct based on these mappings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading menu...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                              <Image
                                src={item.image_url || '/placeholder.svg'}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                {mappingCounts[item.id] > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {mappingCounts[item.id]} ingredient{mappingCounts[item.id] > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryName(item.category_id)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.stock_quantity < 10 ? 'destructive' : 'secondary'}>
                            {item.stock_quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.is_available ? (
                            <Badge variant="default" className="bg-green-600">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMappingDialog(item)}
                              className="gap-1"
                            >
                              <Package2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Inventory</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Item Image</Label>
              <ImageUpload
                currentImage={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                bucket="menu-images"
                folder="items"
                compressImages={true}
                aspectRatio="square"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                />
                <span className="text-sm">Available</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Item Image</Label>
              <ImageUpload
                currentImage={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                bucket="menu-images"
                folder="items"
                compressImages={true}
                aspectRatio="square"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                />
                <span className="text-sm">Available</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inventory Mapping Dialog */}
      <Dialog open={mappingDialogOpen} onOpenChange={setMappingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Mappings for {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Existing Mappings */}
            {itemMappings.length === 0 && !addMappingMode ? (
              <div className="text-center py-8">
                <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No inventory mappings configured
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add inventory items to track raw material usage
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {itemMappings.map((mapping) => (
                  <Card key={mapping.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={mapping.inventory?.image_url || '/placeholder.svg'}
                            alt={mapping.inventory?.name || ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{mapping.inventory?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              defaultValue={mapping.quantity_required}
                              onBlur={(e) => {
                                if (e.target.value !== mapping.quantity_required.toString()) {
                                  handleUpdateMapping(mapping.id, e.target.value)
                                }
                              }}
                              className="h-8 w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                              {mapping.inventory?.unit}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMapping(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Mapping Form */}
            {addMappingMode && (
              <Card className="border-2 border-primary">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inventory-select">Select Inventory Item</Label>
                    <Select
                      value={newMapping.inventory_id}
                      onValueChange={(value) =>
                        setNewMapping({ ...newMapping, inventory_id: value })
                      }
                    >
                      <SelectTrigger id="inventory-select">
                        <SelectValue placeholder="Choose an inventory item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory
                          .filter(
                            (inv) =>
                              !itemMappings.some((m) => m.inventory_id === inv.id)
                          )
                          .map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.name} ({inv.quantity_available} {inv.unit} available)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity-required">Quantity Required</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="quantity-required"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={newMapping.quantity_required}
                        onChange={(e) =>
                          setNewMapping({ ...newMapping, quantity_required: e.target.value })
                        }
                      />
                      {newMapping.inventory_id && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {inventory.find((inv) => inv.id === newMapping.inventory_id)?.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddMapping} className="flex-1">
                      Add Mapping
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddMappingMode(false)
                        setNewMapping({ inventory_id: '', quantity_required: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setAddMappingMode(!addMappingMode)}
              disabled={addMappingMode}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory Item
            </Button>
            <Button onClick={() => setMappingDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
