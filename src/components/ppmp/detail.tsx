/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { PPMPItemManager } from './item-manager';
import { ProcurementSchedule } from './procurement-schedule';
import { BudgetTracker } from './budget-tracker';
import { PPMPDisbursementLinker } from './disbursement-linker';

interface PPMPDetailProps {
  id: string;
}

interface PPMP {
  id: string;
  title: string;
  fiscalYear: number;
  status: string;
  totalEstimatedBudget: number;
  totalAllocatedBudget: number;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
  };
  preparedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  items: PPMPItem[];
  procurementActivities: ProcurementActivity[];
  budgetAllocations: BudgetAllocation[];
  disbursementLinks: DisbursementLink[];
  _count: {
    items: number;
    procurementActivities: number;
    disbursementLinks: number;
  };
}

interface PPMPItem {
  id: string;
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
}

interface ProcurementActivity {
  id: string;
  activity: string;
  startDate: string;
  endDate: string;
  responsibleUnit: string;
  status: string;
}

interface BudgetAllocation {
  id: string;
  budgetCode: string;
  description: string;
  allocatedAmount: number;
  expendedAmount: number;
}

interface DisbursementLink {
  id: string;
  disbursement: {
    id: string;
    payee: string;
    amount: number;
    status: string;
    releaseDate?: string;
  };
}

export function PPMPDetail({ id }: PPMPDetailProps) {
  const [ppmp, setPpmp] = useState<PPMP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    fiscalYear: '',
    totalEstimatedBudget: '',
    totalAllocatedBudget: ''
  });

  useEffect(() => {
    fetchPPMP();
  }, [id]);

  const fetchPPMP = async () => {
    try {
      const response = await fetch(`/api/ppmp/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch PPMP');
      }
      const data = await response.json();
      setPpmp(data);
      setEditData({
        title: data.title,
        fiscalYear: data.fiscalYear.toString(),
        totalEstimatedBudget: data.totalEstimatedBudget.toString(),
        totalAllocatedBudget: data.totalAllocatedBudget.toString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/ppmp/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to submit PPMP');
      }

      await fetchPPMP(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit PPMP');
    }
  };

  const handleApprove = async (remarks?: string) => {
    try {
      const response = await fetch(`/api/ppmp/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });

      if (!response.ok) {
        throw new Error('Failed to approve PPMP');
      }

      await fetchPPMP(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve PPMP');
    }
  };

  const handleReject = async (remarks: string) => {
    try {
      const response = await fetch(`/api/ppmp/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });

      if (!response.ok) {
        throw new Error('Failed to reject PPMP');
      }

      await fetchPPMP(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject PPMP');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/ppmp/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          fiscalYear: parseInt(editData.fiscalYear),
          totalEstimatedBudget: parseFloat(editData.totalEstimatedBudget),
          totalAllocatedBudget: parseFloat(editData.totalAllocatedBudget)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update PPMP');
      }

      setIsEditing(false);
      await fetchPPMP(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update PPMP');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "secondary",
      SUBMITTED: "default",
      APPROVED: "default",
      REJECTED: "destructive",
      IMPLEMENTED: "default"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH');
  };

  const canEdit = ppmp?.status === 'DRAFT';
  const canSubmit = ppmp?.status === 'DRAFT' && ppmp.items.length > 0;
  const canApprove = ppmp?.status === 'SUBMITTED';
  const canReject = ppmp?.status === 'SUBMITTED';

  if (loading) {
    return <div className="text-center py-8">Loading PPMP details...</div>;
  }

  if (error || !ppmp) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error || 'PPMP not found'}</p>
        <Button asChild className="mt-4">
          <Link href="/ppmp">Back to PPMPs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/ppmp">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PPMPs
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{ppmp.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(ppmp.status)}
              <span className="text-sm text-muted-foreground">
                FY {ppmp.fiscalYear}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        title: ppmp.title,
                        fiscalYear: ppmp.fiscalYear.toString(),
                        totalEstimatedBudget: ppmp.totalEstimatedBudget.toString(),
                        totalAllocatedBudget: ppmp.totalAllocatedBudget.toString()
                      });
                    }}
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </>
          )}

          {canSubmit && (
            <Button onClick={handleSubmit} size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          )}

          {canApprove && (
            <Button onClick={() => handleApprove()} size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}

          {canReject && (
            <Button
              onClick={() => {
                const remarks = prompt('Enter rejection remarks:');
                if (remarks) handleReject(remarks);
              }}
              variant="destructive"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PPMP Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1 font-medium">{ppmp.title}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Fiscal Year</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.fiscalYear}
                  onChange={(e) => setEditData(prev => ({ ...prev, fiscalYear: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1 font-medium">{ppmp.fiscalYear}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="mt-1 font-medium flex items-center gap-2">
                <Building className="w-4 h-4" />
                {ppmp.department.name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Prepared By</label>
              <p className="mt-1 font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {ppmp.preparedBy.name}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Estimated Budget</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editData.totalEstimatedBudget}
                  onChange={(e) => setEditData(prev => ({ ...prev, totalEstimatedBudget: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1 font-medium text-green-600">
                  {formatCurrency(ppmp.totalEstimatedBudget)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Allocated Budget</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editData.totalAllocatedBudget}
                  onChange={(e) => setEditData(prev => ({ ...prev, totalAllocatedBudget: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-1 font-medium text-blue-600">
                  {formatCurrency(ppmp.totalAllocatedBudget)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(ppmp.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(ppmp.updatedAt)}
              </span>
            </div>
          </div>

          {ppmp.approvedBy && (
            <div className="pt-2 border-t">
              <label className="text-sm font-medium text-muted-foreground">Approved By</label>
              <p className="mt-1 font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {ppmp.approvedBy.name} ({ppmp.approvedBy.role})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Procurement Items</p>
                <p className="text-2xl font-bold">{ppmp._count.items}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{ppmp._count.procurementActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Linked Disbursements</p>
                <p className="text-2xl font-bold">{ppmp._count.disbursementLinks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed sections */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="items">Procurement Items</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <PPMPItemManager ppmpId={id} items={ppmp.items} canEdit={canEdit} onUpdate={fetchPPMP} />
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <ProcurementSchedule ppmpId={id} activities={ppmp.procurementActivities} canEdit={canEdit} onUpdate={fetchPPMP} />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetTracker ppmpId={id} allocations={ppmp.budgetAllocations} canEdit={canEdit} onUpdate={fetchPPMP} />
        </TabsContent>

        <TabsContent value="disbursements" className="space-y-4">
          <PPMPDisbursementLinker ppmpId={id} links={ppmp.disbursementLinks} onUpdate={fetchPPMP} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
