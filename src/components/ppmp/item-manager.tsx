/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { ProductSelector } from './product-selector';
import { MonthlyAllocationInput } from './monthly-allocation-input';

interface PPMPItemManagerProps {
  ppmpId: string;
  items: PPMPItem[];
  canEdit: boolean;
  onUpdate: () => void;
}

interface PPMPItem {
  id: string;
  productId?: string | null;
  product?: { id: string; description: string } | null;
  category: string;
  itemNo: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  procurementMethod: string;
  schedule?: any;
  remarks?: string;
  jan?: number | null;
  feb?: number | null;
  march?: number | null;
  april?: number | null;
  may?: number | null;
  june?: number | null;
  july?: number | null;
  august?: number | null;
  sept?: number | null;
  oct?: number | null;
  nov?: number | null;
  dec?: number | null;
}

const CATEGORIES = [
  { value: 'GOODS', label: 'Goods' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'CONSULTING_SERVICES', label: 'Consulting Services' },
  { value: 'GENERAL_SERVICES', label: 'General Services' },
  { value: 'OTHERS', label: 'Others' }
];

const PROCUREMENT_METHODS = [
  { value: 'COMPETITIVE_BIDDING', label: 'Competitive Bidding' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'NEGOTIATED_PROCUREMENT', label: 'Negotiated Procurement' },
  { value: 'DIRECT_CONTRACTING', label: 'Direct Contracting' },
  { value: 'REPEAT_ORDER', label: 'Repeat Order' }
];

export function PPMPItemManager({ ppmpId, items, canEdit, onUpdate }: PPMPItemManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PPMPItem | null>(null);
  const [formData, setFormData] = useState({
    productId: null as string | null,
    category: '',
    itemNo: '',
    description: '',
    quantity: '',
    unit: '',
    unitCost: '',
    procurementMethod: '',
    remarks: '',
    monthlyAllocations: {
      jan: null as number | null,
      feb: null as number | null,
      march: null as number | null,
      april: null as number | null,
      may: null as number | null,
      june: null as number | null,
      july: null as number | null,
      august: null as number | null,
      sept: null as number | null,
      oct: null as number | null,
      nov: null as number | null,
      dec: null as number | null
    }
  });

  const resetForm = () => {
    setFormData({
      productId: null,
      category: '',
      itemNo: '',
      description: '',
      quantity: '',
      unit: '',
      unitCost: '',
      procurementMethod: '',
      remarks: '',
      monthlyAllocations: {
        jan: null,
        feb: null,
        march: null,
        april: null,
        may: null,
        june: null,
        july: null,
        august: null,
        sept: null,
        oct: null,
        nov: null,
        dec: null
      }
    });
    setEditingItem(null);
  };

  const openDialog = (item?: PPMPItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        productId: item.productId || null,
        category: item.category,
        itemNo: item.itemNo,
        description: item.description,
        quantity: item.quantity.toString(),
        unit: item.unit,
        unitCost: item.unitCost.toString(),
        procurementMethod: item.procurementMethod,
        remarks: item.remarks || '',
        monthlyAllocations: {
          jan: item.jan || null,
          feb: item.feb || null,
          march: item.march || null,
          april: item.april || null,
          may: item.may || null,
          june: item.june || null,
          july: item.july || null,
          august: item.august || null,
          sept: item.sept || null,
          oct: item.oct || null,
          nov: item.nov || null,
          dec: item.dec || null
        }
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const calculateTotalCost = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitCost = parseFloat(formData.unitCost) || 0;
    return quantity * unitCost;
  };

  const handleCreateProduct = async (description: string) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      productId: formData.productId,
      category: formData.category,
      itemNo: formData.itemNo,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      unitCost: parseFloat(formData.unitCost),
      totalCost: calculateTotalCost(),
      procurementMethod: formData.procurementMethod,
      remarks: formData.remarks,
      ...formData.monthlyAllocations
    };

    try {
      const url = editingItem
        ? `/api/ppmp/${ppmpId}/items/${editingItem.id}`
        : `/api/ppmp/${ppmpId}/items`;

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to save item');
      }

      closeDialog();
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/ppmp/${ppmpId}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { variant: any, label: string }> = {
      GOODS: { variant: 'default', label: 'Goods' },
      INFRASTRUCTURE: { variant: 'secondary', label: 'Infrastructure' },
      CONSULTING_SERVICES: { variant: 'outline', label: 'Consulting' },
      GENERAL_SERVICES: { variant: 'outline', label: 'Services' },
      OTHERS: { variant: 'secondary', label: 'Others' }
    };

    const config = categoryMap[category] || { variant: 'outline', label: category };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const methodMap: Record<string, { variant: any, label: string }> = {
      COMPETITIVE_BIDDING: { variant: 'default', label: 'Competitive' },
      SHOPPING: { variant: 'secondary', label: 'Shopping' },
      NEGOTIATED_PROCUREMENT: { variant: 'outline', label: 'Negotiated' },
      DIRECT_CONTRACTING: { variant: 'outline', label: 'Direct' },
      REPEAT_ORDER: { variant: 'secondary', label: 'Repeat' }
    };

    const config = methodMap[method] || { variant: 'outline', label: method };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Procurement Items
            </CardTitle>
            <CardDescription>
              Manage the procurement items for this PPMP
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Procurement Item' : 'Add Procurement Item'}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the details for the procurement item.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2">
                      <ProductSelector
                        value={formData.productId || undefined}
                        onSelect={(productId) => setFormData(prev => ({ ...prev, productId: productId || null }))}
                        onCreateNew={handleCreateProduct}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="itemNo">Item No.</Label>
                      <Input
                        id="itemNo"
                        value={formData.itemNo}
                        onChange={(e) => setFormData(prev => ({ ...prev, itemNo: e.target.value }))}
                        placeholder="e.g., 001-2025"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of the item"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="e.g., pcs, kg, meters"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unitCost">Unit Cost</Label>
                      <Input
                        id="unitCost"
                        type="number"
                        step="0.01"
                        value={formData.unitCost}
                        onChange={(e) => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalCost">Total Cost</Label>
                      <Input
                        id="totalCost"
                        type="number"
                        step="0.01"
                        value={calculateTotalCost().toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="procurementMethod">Procurement Method</Label>
                      <Select value={formData.procurementMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, procurementMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROCUREMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        value={formData.remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                        placeholder="Additional remarks or notes"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="py-4">
                    <MonthlyAllocationInput
                      values={formData.monthlyAllocations}
                      onChange={(values) => setFormData(prev => ({ 
                        ...prev, 
                        monthlyAllocations: {
                          jan: values.jan ?? null,
                          feb: values.feb ?? null,
                          march: values.march ?? null,
                          april: values.april ?? null,
                          may: values.may ?? null,
                          june: values.june ?? null,
                          july: values.july ?? null,
                          august: values.august ?? null,
                          sept: values.sept ?? null,
                          oct: values.oct ?? null,
                          nov: values.nov ?? null,
                          dec: values.dec ?? null
                        }
                      }))}
                      totalCost={calculateTotalCost()}
                      disabled={!canEdit}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No procurement items added yet.</p>
            {canEdit && (
              <p className="text-sm mt-2">Click &quot;Add Item&quot; to get started.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item No.</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty/Unit</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Method</TableHead>
                {canEdit && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemNo}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      {item.remarks && (
                        <p className="text-sm text-muted-foreground">{item.remarks}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(item.category)}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.totalCost)}</TableCell>
                  <TableCell>{getMethodBadge(item.procurementMethod)}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {items.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Items: {items.length}</span>
              <span className="font-bold text-lg">
                Total Value: {formatCurrency(items.reduce((sum, item) => sum + item.totalCost, 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
