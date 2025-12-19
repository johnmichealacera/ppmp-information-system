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
import { FileText, Plus, Trash2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PurchaseRequest {
  id: string;
  prNo: string;
  status: string;
  officeEmployee: {
    employee: { name: string };
    office: { name: string };
  };
}

interface PPMPItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  unitCost: number;
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

interface RFQProduct {
  prId?: string;
  ppmpProductId?: string;
  unit: string;
  qty: number;
  pr?: PurchaseRequest;
  ppmpProduct?: PPMPItem;
}

export function ConsolidatedRFQForm({ rfqId }: { rfqId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    consoNo: '',
    category: '',
    description: '',
    officeEmployeeId: ''
  });
  const [officeEmployees, setOfficeEmployees] = useState<OfficeEmployee[]>([]);
  const [availablePRs, setAvailablePRs] = useState<PurchaseRequest[]>([]);
  const [availablePPMPItems, setAvailablePPMPItems] = useState<PPMPItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<RFQProduct[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({
    sourceType: 'pr' as 'pr' | 'ppmp',
    prId: '',
    ppmpProductId: '',
    unit: '',
    qty: ''
  });

  useEffect(() => {
    fetchOfficeEmployees();
    fetchAvailablePRs();
    fetchAvailablePPMPItems();
    if (rfqId) {
      fetchRFQ();
    }
  }, [rfqId]);

  const fetchOfficeEmployees = async () => {
    try {
      // Placeholder - create /api/office-employees endpoint
      const response = await fetch('/api/departments');
      if (response.ok) {
        // Transform data as needed
      }
    } catch (error) {
      console.error('Error fetching office employees:', error);
    }
  };

  const fetchAvailablePRs = async () => {
    try {
      const response = await fetch('/api/purchase-requests?status=APPROVED');
      if (response.ok) {
        const data = await response.json();
        setAvailablePRs(data);
      }
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
    }
  };

  const fetchAvailablePPMPItems = async () => {
    try {
      const response = await fetch('/api/ppmp?status=APPROVED');
      if (response.ok) {
        const ppmps = await response.json();
        const allItems: PPMPItem[] = [];
        for (const ppmp of ppmps) {
          const itemsResponse = await fetch(`/api/ppmp/${ppmp.id}/items`);
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            allItems.push(...items);
          }
        }
        setAvailablePPMPItems(allItems);
      }
    } catch (error) {
      console.error('Error fetching PPMP items:', error);
    }
  };

  const fetchRFQ = async () => {
    if (!rfqId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/consolidated-rfq/${rfqId}`);
      if (response.ok) {
        const rfq = await response.json();
        setFormData({
          consoNo: rfq.consoNo,
          category: rfq.category || '',
          description: rfq.description || '',
          officeEmployeeId: rfq.officeEmployeeId
        });
        setSelectedProducts(rfq.products.map((p: any) => ({
          prId: p.prId || undefined,
          ppmpProductId: p.ppmpProductId || undefined,
          unit: p.unit,
          qty: parseFloat(p.qty),
          pr: p.pr,
          ppmpProduct: p.ppmpProduct
        })));
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!productFormData.unit || !productFormData.qty) {
      alert('Please fill in unit and quantity');
      return;
    }

    if (productFormData.sourceType === 'pr' && !productFormData.prId) {
      alert('Please select a purchase request');
      return;
    }

    if (productFormData.sourceType === 'ppmp' && !productFormData.ppmpProductId) {
      alert('Please select a PPMP item');
      return;
    }

    const newProduct: RFQProduct = {
      unit: productFormData.unit,
      qty: parseFloat(productFormData.qty)
    };

    if (productFormData.sourceType === 'pr') {
      const pr = availablePRs.find(p => p.id === productFormData.prId);
      newProduct.prId = productFormData.prId;
      newProduct.pr = pr;
    } else {
      const item = availablePPMPItems.find(i => i.id === productFormData.ppmpProductId);
      newProduct.ppmpProductId = productFormData.ppmpProductId;
      newProduct.ppmpProduct = item;
    }

    setSelectedProducts(prev => [...prev, newProduct]);
    setProductFormData({
      sourceType: 'pr',
      prId: '',
      ppmpProductId: '',
      unit: '',
      qty: ''
    });
    setIsProductDialogOpen(false);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consoNo || !formData.officeEmployeeId) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setSubmitting(true);
    try {
      const url = rfqId ? `/api/consolidated-rfq/${rfqId}` : '/api/consolidated-rfq';
      const method = rfqId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products: selectedProducts.map(product => ({
            prId: product.prId || null,
            ppmpProductId: product.ppmpProductId || null,
            unit: product.unit,
            qty: product.qty
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save consolidated RFQ');
      }

      router.push('/consolidated-rfq');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save consolidated RFQ');
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
            {rfqId ? 'Edit Consolidated RFQ' : 'Create Consolidated RFQ'}
          </CardTitle>
          <CardDescription>
            Consolidate multiple purchase requests or PPMP items into a single RFQ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consoNo">Consolidated RFQ Number *</Label>
              <Input
                id="consoNo"
                value={formData.consoNo}
                onChange={(e) => setFormData(prev => ({ ...prev, consoNo: e.target.value }))}
                placeholder="e.g., CRFQ-2025-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Office Supplies"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the consolidated RFQ"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Products</h3>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                    <DialogDescription>
                      Add a product from a Purchase Request or directly from PPMP
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Source Type</Label>
                      <Select
                        value={productFormData.sourceType}
                        onValueChange={(value: 'pr' | 'ppmp') => {
                          setProductFormData(prev => ({
                            ...prev,
                            sourceType: value,
                            prId: '',
                            ppmpProductId: ''
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pr">From Purchase Request</SelectItem>
                          <SelectItem value="ppmp">From PPMP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {productFormData.sourceType === 'pr' ? (
                      <div className="space-y-2">
                        <Label>Purchase Request</Label>
                        <Select
                          value={productFormData.prId}
                          onValueChange={(value) => setProductFormData(prev => ({ ...prev, prId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select PR" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePRs.map((pr) => (
                              <SelectItem key={pr.id} value={pr.id}>
                                {pr.prNo} - {pr.officeEmployee.office.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>PPMP Item</Label>
                        <Select
                          value={productFormData.ppmpProductId}
                          onValueChange={(value) => {
                            const item = availablePPMPItems.find(i => i.id === value);
                            setProductFormData(prev => ({
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
                            {availablePPMPItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.itemNo} - {item.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input
                          value={productFormData.unit}
                          onChange={(e) => setProductFormData(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="e.g., pcs, kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productFormData.qty}
                          onChange={(e) => setProductFormData(prev => ({ ...prev, qty: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddProduct}>
                      Add Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products added yet.</p>
                <p className="text-sm mt-2">Click &quot;Add Product&quot; to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Item/PR</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {product.prId ? (
                          <Badge variant="default">PR</Badge>
                        ) : (
                          <Badge variant="secondary">PPMP</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.pr?.prNo || product.ppmpProduct?.itemNo || '-'}
                      </TableCell>
                      <TableCell>
                        {product.pr 
                          ? `${product.pr.officeEmployee.office.name} - ${product.pr.officeEmployee.employee.name}`
                          : product.ppmpProduct?.description || '-'}
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.qty}</TableCell>
                      <TableCell>
                        {product.ppmpProduct 
                          ? `₱${product.ppmpProduct.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.ppmpProduct
                          ? `₱${((product.ppmpProduct.unitCost || 0) * product.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(index)}
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
              {submitting ? 'Saving...' : rfqId ? 'Update RFQ' : 'Create RFQ'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

