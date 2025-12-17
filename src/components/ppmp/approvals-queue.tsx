'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Clock, Building, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
  };
  _count: {
    items: number;
    procurementActivities: number;
    disbursementLinks: number;
  };
}

export function PPMPApprovalsQueue() {
  const [ppmp, setPpmp] = useState<PPMP[]>([]);
  const [selectedPpmp, setSelectedPpmp] = useState<PPMP | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ppmp/approvals/pending');
      if (response.ok) {
        const data = await response.json();
        setPpmp(data);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ppmpId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/ppmp/${ppmpId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Approved' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve PPMP');
      }

      await fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve PPMP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPpmp || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/ppmp/${selectedPpmp.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: rejectionReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject PPMP');
      }

      setShowRejectDialog(false);
      setSelectedPpmp(null);
      setRejectionReason('');
      await fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reject PPMP');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (ppmp: PPMP) => {
    setSelectedPpmp(ppmp);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceSubmission = (submittedAt: string) => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{ppmp.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">
                  {new Set(ppmp.map(item => item.department.id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(ppmp.reduce((sum, item) => sum + item.totalEstimatedBudget, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pending PPMP Approvals
          </CardTitle>
          <CardDescription>
            Review and take action on submitted procurement plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading approvals...</p>
            </div>
          ) : ppmp.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-600" />
              <p className="text-lg font-medium">All caught up!</p>
              <p>No pending PPMP approvals at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PPMP Details</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ppmp.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Prepared by: {item.preparedBy.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          {item.department.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.fiscalYear}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatCurrency(item.totalEstimatedBudget)}</p>
                          <p className="text-xs text-muted-foreground">
                            Alloc: {formatCurrency(item.totalAllocatedBudget)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item._count.items}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(item.updatedAt)}</p>
                          <p className="text-muted-foreground">
                            {getDaysSinceSubmission(item.updatedAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ppmp/${item.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRejectDialog(item)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reject PPMP
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this PPMP. This will be communicated to the preparer.
            </DialogDescription>
          </DialogHeader>

          {selectedPpmp && (
            <div className="py-4">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <h4 className="font-medium">{selectedPpmp.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPpmp.department.name} • FY {selectedPpmp.fiscalYear}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="rejectionReason" className="text-sm font-medium">
                  Rejection Reason *
                </label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please explain why this PPMP is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
              variant="destructive"
            >
              {actionLoading ? 'Rejecting...' : 'Reject PPMP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
