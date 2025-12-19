'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  description: string;
}

interface ProductSelectorProps {
  value?: string;
  onSelect: (productId: string | null) => void;
  onCreateNew?: (description: string) => Promise<Product>;
  disabled?: boolean;
  placeholder?: string;
}

export function ProductSelector({
  value,
  onSelect,
  onCreateNew,
  disabled = false,
  placeholder = 'Select product...'
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProductDescription, setNewProductDescription] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === value);

  const handleCreateProduct = async () => {
    if (!newProductDescription.trim() || !onCreateNew) return;

    try {
      const newProduct = await onCreateNew(newProductDescription.trim());
      setProducts((prev) => [newProduct, ...prev]);
      onSelect(newProduct.id);
      setIsCreateDialogOpen(false);
      setNewProductDescription('');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    }
  };

  return (
    <div className="space-y-2">
      <Label>Product (Optional)</Label>
      <div className="flex gap-2">
        <Select
          value={value || 'none'}
          onValueChange={(val) => onSelect(val === 'none' ? null : val)}
          disabled={disabled || loading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Custom Description)</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onCreateNew && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={disabled}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to the master catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product-description">Product Description</Label>
                  <Input
                    id="product-description"
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewProductDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProduct}
                  disabled={!newProductDescription.trim()}
                >
                  Create Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {selectedProduct && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedProduct.description}
        </p>
      )}
    </div>
  );
}

