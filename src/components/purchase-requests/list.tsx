/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface PurchaseRequest {
  id: string;
  prNo: string;
  status: string;
  purpose?: string;
  ppmpAligned: boolean;
  createdAt: string;
  officeEmployee: {
    employee: {
      id: string;
      name: string;
    };
    office: {
      id: string;
      name: string;
    };
  };
  _count: {
    products: number;
  };
}

export function PurchaseRequestList() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPRs();
  }, [statusFilter]);

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all'
        ? `/api/purchase-requests?status=${statusFilter}`
        : '/api/purchase-requests';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPrs(data);
      }
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      DRAFT: { variant: 'secondary', label: 'Draft' },
      SUBMITTED: { variant: 'default', label: 'Submitted' },
      APPROVED: { variant: 'default', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' }
    };

    const config = statusMap[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const filteredPRs = prs.filter((pr) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pr.prNo.toLowerCase().includes(query) ||
      pr.purpose?.toLowerCase().includes(query) ||
      pr.officeEmployee.employee.name.toLowerCase().includes(query) ||
      pr.officeEmployee.office.name.toLowerCase().includes(query)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Purchase Requests
            </CardTitle>
            <CardDescription>
              Manage purchase requests from PPMP items
            </CardDescription>
          </div>
          <Link href="/purchase-requests/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create PR
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by PR number, purpose, or office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading purchase requests...
          </div>
        ) : filteredPRs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No purchase requests found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR Number</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>PPMP Aligned</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPRs.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.prNo}</TableCell>
                  <TableCell>{pr.officeEmployee.office.name}</TableCell>
                  <TableCell>{pr.officeEmployee.employee.name}</TableCell>
                  <TableCell>{pr.purpose || '-'}</TableCell>
                  <TableCell>{getStatusBadge(pr.status)}</TableCell>
                  <TableCell>{pr._count.products}</TableCell>
                  <TableCell>
                    {pr.ppmpAligned ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(pr.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/purchase-requests/${pr.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

