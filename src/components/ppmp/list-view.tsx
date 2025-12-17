'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, FileText, Building, Calendar, Plus, Eye, Edit } from 'lucide-react';
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
  approvedBy?: {
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

interface Department {
  id: string;
  name: string;
  code?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'IMPLEMENTED', label: 'Implemented' }
];

const FISCAL_YEAR_OPTIONS = [
  { value: '', label: 'All Years' },
  ...Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  })
];

export function PPMPListView() {
  const [ppmp, setPpmp] = useState<PPMP[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    fiscalYear: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchPPMP();
  }, []);

  useEffect(() => {
    fetchPPMP();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPPMP = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.fiscalYear) queryParams.set('fiscalYear', filters.fiscalYear);
      if (filters.departmentId) queryParams.set('departmentId', filters.departmentId);

      const response = await fetch(`/api/ppmp?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPpmp(data);
      }
    } catch (error) {
      console.error('Error fetching PPMPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      fiscalYear: '',
      departmentId: ''
    });
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
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Filter PPMPs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search PPMPs..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year</Label>
              <Select value={filters.fiscalYear} onValueChange={(value) => updateFilter('fiscalYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  {FISCAL_YEAR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={filters.departmentId} onValueChange={(value) => updateFilter('departmentId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                PPMPs
              </CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${ppmp.length} PPMP${ppmp.length !== 1 ? 's' : ''} found`}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/ppmp/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New PPMP
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading PPMPs...</p>
            </div>
          ) : ppmp.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No PPMPs found matching your criteria.</p>
              <Button asChild className="mt-4">
                <Link href="/ppmp/create">Create Your First PPMP</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Estimated Budget</TableHead>
                    <TableHead className="text-right">Allocated Budget</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-center">Activities</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ppmp.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">ID: {item.id.slice(-8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          {item.department.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {item.fiscalYear}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalEstimatedBudget)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalAllocatedBudget)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item._count.items}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item._count.procurementActivities}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ppmp/${item.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          {item.status === 'DRAFT' && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/ppmp/${item.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
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
    </div>
  );
}
