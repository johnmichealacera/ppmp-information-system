'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PPMPStats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  implemented: number;
}

interface RecentPPMP {
  id: string;
  title: string;
  status: string;
  department: {
    name: string;
  };
  fiscalYear: number;
  totalEstimatedBudget: number;
  updatedAt: string;
}

export function PPMPDashboard() {
  const [stats, setStats] = useState<PPMPStats | null>(null);
  const [recentPPMPs, setRecentPPMPs] = useState<RecentPPMP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPPMPData();
  }, []);

  const fetchPPMPData = async () => {
    try {
      const [statsResponse, recentResponse] = await Promise.all([
        fetch('/api/ppmp/stats'),
        fetch('/api/ppmp/recent')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentPPMPs(recentData);
      }
    } catch (error) {
      console.error('Error fetching PPMP data:', error);
      // For development: show mock data when API fails
      setStats({
        total: 3,
        draft: 2,
        submitted: 0,
        approved: 1,
        rejected: 0,
        implemented: 0
      });
      setRecentPPMPs([
        {
          id: 'test-ppmp-1',
          title: 'Test Office Supplies PPMP FY 2025',
          status: 'DRAFT',
          department: { name: 'General Services Office' },
          fiscalYear: 2025,
          totalEstimatedBudget: 50000,
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <Button asChild>
          <Link href="/ppmp/create">
            <Plus className="w-4 h-4 mr-2" />
            Create New PPMP
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PPMPs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent PPMPs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent PPMPs</CardTitle>
          <CardDescription>
            Latest procurement plans and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentPPMPs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No PPMPs found. Create your first procurement plan.
            </p>
          ) : (
            <div className="space-y-4">
              {recentPPMPs.map((ppmp) => (
                <div
                  key={ppmp.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{ppmp.title}</h3>
                      {getStatusBadge(ppmp.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {ppmp.department.name} • FY {ppmp.fiscalYear} •
                      {formatCurrency(ppmp.totalEstimatedBudget)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {formatDate(ppmp.updatedAt)}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ppmp/${ppmp.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">My PPMPs</CardTitle>
            <CardDescription>
              View and manage your department&apos;s procurement plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/ppmp/list">View All PPMPs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Approval Queue</CardTitle>
            <CardDescription>
              Review and approve submitted procurement plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/ppmp/approvals">View Approvals</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Reports</CardTitle>
            <CardDescription>
              Generate procurement monitoring reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/ppmp/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
