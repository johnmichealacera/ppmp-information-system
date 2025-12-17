'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetTrackerProps {
  ppmpId: string;
  allocations: BudgetAllocation[];
  canEdit: boolean;
  onUpdate: () => void;
}

interface BudgetAllocation {
  id: string;
  budgetCode: string;
  description: string;
  allocatedAmount: number;
  expendedAmount: number;
}

export function BudgetTracker({ ppmpId, allocations, canEdit, onUpdate }: BudgetTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<BudgetAllocation | null>(null);
  const [formData, setFormData] = useState({
    budgetCode: '',
    description: '',
    allocatedAmount: ''
  });

  const resetForm = () => {
    setFormData({
      budgetCode: '',
      description: '',
      allocatedAmount: ''
    });
    setEditingAllocation(null);
  };

  const openDialog = (allocation?: BudgetAllocation) => {
    if (allocation) {
      setEditingAllocation(allocation);
      setFormData({
        budgetCode: allocation.budgetCode,
        description: allocation.description,
        allocatedAmount: allocation.allocatedAmount.toString()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      budgetCode: formData.budgetCode,
      description: formData.description,
      allocatedAmount: parseFloat(formData.allocatedAmount)
    };

    try {
      const url = editingAllocation
        ? `/api/ppmp/${ppmpId}/budget/${editingAllocation.id}`
        : `/api/ppmp/${ppmpId}/budget`;

      const response = await fetch(url, {
        method: editingAllocation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to save budget allocation');
      }

      closeDialog();
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save budget allocation');
    }
  };

  const handleDelete = async (allocationId: string) => {
    if (!confirm('Are you sure you want to delete this budget allocation?')) return;

    try {
      const response = await fetch(`/api/ppmp/${ppmpId}/budget/${allocationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget allocation');
      }

      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete budget allocation');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getUtilizationPercentage = (allocated: number, expended: number) => {
    if (allocated === 0) return 0;
    return Math.min((expended / allocated) * 100, 100);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
  const totalExpended = allocations.reduce((sum, alloc) => sum + alloc.expendedAmount, 0);
  const totalUtilization = getUtilizationPercentage(totalAllocated, totalExpended);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Allocations
            </CardTitle>
            <CardDescription>
              Track budget allocations and expenditure monitoring
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Allocation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAllocation ? 'Edit Budget Allocation' : 'Add Budget Allocation'}
                    </DialogTitle>
                    <DialogDescription>
                      Define budget allocation details and amounts.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="budgetCode">Budget Code (COA)</Label>
                      <Input
                        id="budgetCode"
                        value={formData.budgetCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetCode: e.target.value }))}
                        placeholder="e.g., 1-01-01-010"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Budget line item description"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allocatedAmount">Allocated Amount</Label>
                      <Input
                        id="allocatedAmount"
                        type="number"
                        step="0.01"
                        value={formData.allocatedAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAllocation ? 'Update Allocation' : 'Add Allocation'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {allocations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No budget allocations defined yet.</p>
            {canEdit && (
              <p className="text-sm mt-2">Click &quot;Add Allocation&quot; to define budget lines.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalAllocated)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Expended</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalExpended)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                      <p className={`text-2xl font-bold ${getUtilizationColor(totalUtilization)}`}>
                        {totalUtilization.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className={getUtilizationColor(totalUtilization)}>
                      {totalUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={totalUtilization}
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(totalExpended)} expended</span>
                    <span>{formatCurrency(totalAllocated)} allocated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Lines Table */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Budget Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Expended</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Utilization</TableHead>
                      {canEdit && <TableHead className="w-20">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation) => {
                      const utilization = getUtilizationPercentage(allocation.allocatedAmount, allocation.expendedAmount);
                      const remaining = allocation.allocatedAmount - allocation.expendedAmount;

                      return (
                        <TableRow key={allocation.id}>
                          <TableCell className="font-medium">{allocation.budgetCode}</TableCell>
                          <TableCell>{allocation.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(allocation.allocatedAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(allocation.expendedAmount)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(remaining)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{utilization.toFixed(1)}%</span>
                              </div>
                              <Progress
                                value={utilization}
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          {canEdit && (
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDialog(allocation)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(allocation.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
