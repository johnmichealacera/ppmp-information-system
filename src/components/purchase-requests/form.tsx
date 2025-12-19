/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Trash2, Package, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PPMPItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  unitCost: number;
  product?: { id: string; description: string } | null;
  ppmp: {
    id: string;
    title: string;
    ppmpNo?: string | null;
  };
}

interface OfficeEmployee {
  id: string;
  employee: {
    id: string;
    name: string;
  };
  office: {
    id: string;
    name: string;
  };
}

interface PRProduct {
  ppmpProductId: string;
  unit: string;
  qty: number;
  ppmpProduct?: PPMPItem;
}

export function PurchaseRequestForm({ prId }: { prId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    prNo: '',
    purpose: '',
    remarks: '',
    ppmpAligned: false,
    officeEmployeeId: ''
  });
  const [officeEmployees, setOfficeEmployees] = useState<OfficeEmployee[]>([]);
  const [availableItems, setAvailableItems] = useState<PPMPItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<PRProduct[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    ppmpProductId: '',
    unit: '',
    qty: ''
  });

  useEffect(() => {
    fetchOfficeEmployees();
    fetchAvailableItems();
    if (prId) {
      fetchPR();
    }
  }, [prId]);

  const fetchOfficeEmployees = async () => {
    try {
      // This would need an API endpoint - for now using a placeholder
      // You'll need to create /api/office-employees endpoint
      const response = await fetch('/api/departments');
      if (response.ok) {
        const departments = await response.json();
        // Transform to office employees format
        // This is a placeholder - adjust based on your actual API
      }
    } catch (error) {
      console.error('Error fetching office employees:', error);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      // Fetch PPMP items that can be used for PR
      const response = await fetch('/api/ppmp?status=APPROVED');
      if (response.ok) {
        const ppmps = await response.json();
        const allItems: PPMPItem[] = [];
        for (const ppmp of ppmps) {
          const itemsResponse = await fetch(`/api/ppmp/${ppmp.id}/items`);
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            allItems.push(...items.map((item: any) => ({
              ...item,
              ppmp: { id: ppmp.id, title: ppmp.title, ppmpNo: ppmp.ppmpNo }
            })));
          }
        }
        setAvailableItems(allItems);
      }
    } catch (error) {
      console.error('Error fetching available items:', error);
    }
  };

  const fetchPR = async () => {
    if (!prId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/purchase-requests/${prId}`);
      if (response.ok) {
        const pr = await response.json();
        setFormData({
          prNo: pr.prNo,
          purpose: pr.purpose || '',
          remarks: pr.remarks || '',
          ppmpAligned: pr.ppmpAligned,
          officeEmployeeId: pr.officeEmployeeId
        });
        setSelectedItems(pr.products.map((p: any) => ({
          ppmpProductId: p.ppmpProductId,
          unit: p.unit,
          qty: parseFloat(p.qty),
          ppmpProduct: p.ppmpProduct
        })));
      }
    } catch (error) {
      console.error('Error fetching PR:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!itemFormData.ppmpProductId || !itemFormData.unit || !itemFormData.qty) {
      alert('Please fill in all item fields');
      return;
    }

    const selectedItem = availableItems.find(item => item.id === itemFormData.ppmpProductId);
    if (!selectedItem) return;

    setSelectedItems(prev => [...prev, {
      ppmpProductId: itemFormData.ppmpProductId,
      unit: itemFormData.unit,
      qty: parseFloat(itemFormData.qty),
      ppmpProduct: selectedItem
    }]);

    setItemFormData({ ppmpProductId: '', unit: '', qty: '' });
    setIsItemDialogOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prNo || !formData.officeEmployeeId) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const url = prId ? `/api/purchase-requests/${prId}` : '/api/purchase-requests';
      const method = prId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products: selectedItems.map(item => ({
            ppmpProductId: item.ppmpProductId,
            unit: item.unit,
            qty: item.qty
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save purchase request');
      }

      router.push('/purchase-requests');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save purchase request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {prId ? 'Edit Purchase Request' : 'Create Purchase Request'}
          </CardTitle>
          <CardDescription>
            Create a purchase request from approved PPMP items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prNo">PR Number *</Label>
              <Input
                id="prNo"
                value={formData.prNo}
                onChange={(e) => setFormData(prev => ({ ...prev, prNo: e.target.value }))}
                placeholder="e.g., PR-2025-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeEmployeeId">Office/Employee *</Label>
              <Select
                value={formData.officeEmployeeId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, officeEmployeeId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select office/employee" />
                </SelectTrigger>
                <SelectContent>
                  {officeEmployees.map((oe) => (
                    <SelectItem key={oe.id} value={oe.id}>
                      {oe.office.name} - {oe.employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Purpose of this purchase request"
                rows={2}
              />
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

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="ppmpAligned"
                checked={formData.ppmpAligned}
                onChange={(e) => setFormData(prev => ({ ...prev, ppmpAligned: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="ppmpAligned" className="cursor-pointer">
                PPMP Aligned
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Item from PPMP</DialogTitle>
                    <DialogDescription>
                      Select a PPMP item to add to this purchase request
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>PPMP Item</Label>
                      <Select
                        value={itemFormData.ppmpProductId}
                        onValueChange={(value) => {
                          const item = availableItems.find(i => i.id === value);
                          setItemFormData(prev => ({
                            ...prev,
                            ppmpProductId: value,
                            unit: item?.unit || ''
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select PPMP item" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.itemNo} - {item.description} ({item.ppmp.title})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input
                          value={itemFormData.unit}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="e.g., pcs, kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={itemFormData.qty}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, qty: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddItem}>
                      Add Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet.</p>
                <p className="text-sm mt-2">Click &quot;Add Item&quot; to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>PPMP</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.ppmpProduct?.itemNo || '-'}
                      </TableCell>
                      <TableCell>{item.ppmpProduct?.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.ppmpProduct?.ppmp.ppmpNo || item.ppmpProduct?.ppmp.title || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>
                        ₱{item.ppmpProduct?.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₱{((item.ppmpProduct?.unitCost || 0) * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : prId ? 'Update PR' : 'Create PR'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

