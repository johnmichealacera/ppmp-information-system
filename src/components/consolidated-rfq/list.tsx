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

interface ConsolidatedRFQ {
  id: string;
  consoNo: string;
  category?: string;
  status: string;
  description?: string;
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

export function ConsolidatedRFQList() {
  const [rfqs, setRfqs] = useState<ConsolidatedRFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRFQs();
  }, [statusFilter]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all'
        ? `/api/consolidated-rfq?status=${statusFilter}`
        : '/api/consolidated-rfq';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRfqs(data);
      }
    } catch (error) {
      console.error('Error fetching consolidated RFQs:', error);
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
      CANCELLED: { variant: 'outline', label: 'Cancelled' },
      AWARDED: { variant: 'default', label: 'Awarded' }
    };

    const config = statusMap[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const filteredRFQs = rfqs.filter((rfq) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rfq.consoNo.toLowerCase().includes(query) ||
      rfq.description?.toLowerCase().includes(query) ||
      rfq.category?.toLowerCase().includes(query) ||
      rfq.officeEmployee.employee.name.toLowerCase().includes(query) ||
      rfq.officeEmployee.office.name.toLowerCase().includes(query)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Consolidated RFQs
            </CardTitle>
            <CardDescription>
              Manage consolidated requests for quotation from multiple purchase requests
            </CardDescription>
          </div>
          <Link href="/consolidated-rfq/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Consolidated RFQ
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by RFQ number, category, or office..."
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
              <SelectItem value="AWARDED">Awarded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading consolidated RFQs...
          </div>
        ) : filteredRFQs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No consolidated RFQs found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ Number</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRFQs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-medium">{rfq.consoNo}</TableCell>
                  <TableCell>{rfq.category || '-'}</TableCell>
                  <TableCell>{rfq.officeEmployee.office.name}</TableCell>
                  <TableCell>{rfq.officeEmployee.employee.name}</TableCell>
                  <TableCell>{rfq.description || '-'}</TableCell>
                  <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                  <TableCell>{rfq._count.products}</TableCell>
                  <TableCell>
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/consolidated-rfq/${rfq.id}`}>
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

