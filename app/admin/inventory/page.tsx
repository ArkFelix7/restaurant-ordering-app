'use client'

import { useState, useEffect } from 'react'
import { Inventory } from '@/lib/types'
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
import { Plus, Edit, Package, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/image-upload'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    quantity_available: '',
    unit: 'kg',
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setInventory(data)
    } catch (error) {
      console.error('Error loading inventory:', error)
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
        .from('inventory')
        .insert([
          {
            name: formData.name,
            image_url: formData.image_url || null,
            quantity_available: parseInt(formData.quantity_available),
            unit: formData.unit,
          },
        ])
        .select()

      if (error) throw error
      if (data) {
        setInventory([...inventory, data[0]])
        setAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error adding inventory:', error)
      alert('Failed to add inventory item')
    }
  }

  const handleUpdateItem = async () => {
    if (!selectedItem) return

    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          name: formData.name,
          image_url: formData.image_url || null,
          quantity_available: parseInt(formData.quantity_available),
          unit: formData.unit,
        })
        .eq('id', selectedItem.id)

      if (error) throw error

      setInventory(
        inventory.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                name: formData.name,
                image_url: formData.image_url || null,
                quantity_available: parseInt(formData.quantity_available),
                unit: formData.unit,
              }
            : item
        )
      )
      setEditDialogOpen(false)
      setSelectedItem(null)
      resetForm()
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('Failed to update inventory item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return

    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id)
      if (error) throw error
      setInventory(inventory.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Error deleting inventory:', error)
      alert('Failed to delete inventory item')
    }
  }

  const openEditDialog = (item: Inventory) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      image_url: item.image_url || '',
      quantity_available: item.quantity_available.toString(),
      unit: item.unit,
    })
    setEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      image_url: '',
      quantity_available: '',
      unit: 'kg',
    })
  }

  const lowStockItems = inventory.filter((item) => item.quantity_available < 10)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Inventory Management
              </h1>
              <p className="text-muted-foreground">Manage raw ingredients and supplies</p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory Item
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventory.filter((item) => item.quantity_available > 10).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                The following items are running low on stock:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <Badge key={item.id} variant="outline" className="gap-1">
                    {item.name}
                    <span className="text-yellow-600">({item.quantity_available} {item.unit})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading inventory...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity Available</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
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
                            <div className="font-medium">{item.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.quantity_available < 10 ? 'destructive' : 'secondary'
                            }
                          >
                            {item.quantity_available}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
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
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity_available}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity_available: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, liters, units, etc."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Inventory Image</Label>
              <ImageUpload
                currentImage={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                bucket="inventory-images"
                folder="raw-materials"
                compressImages={true}
                aspectRatio="square"
              />
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
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity_available}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity_available: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit *</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, liters, units, etc."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Inventory Image</Label>
              <ImageUpload
                currentImage={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                bucket="inventory-images"
                folder="raw-materials"
                compressImages={true}
                aspectRatio="square"
              />
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
    </div>
  )
}
