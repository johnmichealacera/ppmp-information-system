'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';

interface ReportData {
  summary: {
    totalPpmp: number;
    approvedPpmp: number;
    totalBudget: number;
    utilizedBudget: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  byDepartment: Array<{
    department: string;
    count: number;
    totalBudget: number;
  }>;
  byFiscalYear: Array<{
    year: number;
    count: number;
    totalBudget: number;
  }>;
  procurementMethods: Array<{
    method: string;
    count: number;
    totalValue: number;
  }>;
  topItems: Array<{
    description: string;
    totalCost: number;
    procurementMethod: string;
  }>;
}

export function PPMPReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [selectedYear, selectedDepartment]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear !== 'all') params.set('year', selectedYear);
      if (selectedDepartment !== 'all') params.set('department', selectedDepartment);

      const response = await fetch(`/api/ppmp/reports?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-500',
      SUBMITTED: 'bg-blue-500',
      APPROVED: 'bg-green-500',
      REJECTED: 'bg-red-500',
      IMPLEMENTED: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const exportReport = () => {
    // TODO: Implement report export functionality
    alert('Export functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">Failed to load reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Filter reports by fiscal year and department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fiscal Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {/* TODO: Fetch and populate departments */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total PPMPs</p>
                <p className="text-2xl font-bold">{reportData.summary.totalPpmp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{reportData.summary.approvedPpmp}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(reportData.summary.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Utilized</p>
                <p className="text-2xl font-bold">
                  {reportData.summary.totalBudget > 0
                    ? ((reportData.summary.utilizedBudget / reportData.summary.totalBudget) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              PPMP Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="capitalize">{item.status.toLowerCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{item.count}</span>
                    <span className="text-muted-foreground ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              By Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.byDepartment.slice(0, 5).map((item) => (
                <div key={item.department} className="flex items-center justify-between">
                  <span className="truncate flex-1">{item.department}</span>
                  <div className="text-right ml-4">
                    <span className="font-medium">{item.count} PPMPs</span>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.totalBudget)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Procurement Methods Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procurement Method</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.procurementMethods.map((method) => {
                const totalValue = reportData.procurementMethods.reduce((sum, m) => sum + m.totalValue, 0);
                const percentage = totalValue > 0 ? (method.totalValue / totalValue) * 100 : 0;

                return (
                  <TableRow key={method.method}>
                    <TableCell>
                      <Badge variant="outline">{method.method.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{method.count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(method.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Procurement Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Procurement Items</CardTitle>
          <CardDescription>Highest value procurement items</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Description</TableHead>
                <TableHead>Procurement Method</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.topItems.slice(0, 10).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.procurementMethod.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
