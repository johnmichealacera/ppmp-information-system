/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/reports - Get PPMP reports data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const department = searchParams.get('department');

    // Build where clause for filters
    const where: any = {};
    if (year && year !== 'all') {
      where.fiscalYear = parseInt(year);
    }
    if (department && department !== 'all') {
      where.departmentId = department;
    }

    // Get summary data
    const totalPpmp = await db.pPMP.count({ where });
    const approvedPpmp = await db.pPMP.count({
      where: { ...where, status: 'APPROVED' }
    });

    const budgetSummary = await db.pPMP.aggregate({
      where,
      _sum: {
        totalEstimatedBudget: true,
        totalAllocatedBudget: true
      }
    });

    // Get status distribution
    const statusCounts = await db.pPMP.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    const byStatus = statusCounts.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: totalPpmp > 0 ? (item._count.status / totalPpmp) * 100 : 0
    }));

    // Get department summary
    const departmentSummary = await db.pPMP.groupBy({
      by: ['departmentId'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalEstimatedBudget: true
      }
    });

    const departments = await db.departmentDirectory.findMany({
      where: {
        id: { in: departmentSummary.map(d => d.departmentId) }
      },
      select: { id: true, name: true }
    });

    const deptMap = new Map(departments.map(d => [d.id, d.name]));

    const byDepartment = departmentSummary.map(item => ({
      department: deptMap.get(item.departmentId) || 'Unknown',
      count: item._count.id,
      totalBudget: item._sum.totalEstimatedBudget || 0
    }));

    // Get fiscal year summary
    const yearSummary = await db.pPMP.groupBy({
      by: ['fiscalYear'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalEstimatedBudget: true
      }
    });

    const byFiscalYear = yearSummary.map(item => ({
      year: item.fiscalYear,
      count: item._count.id,
      totalBudget: item._sum.totalEstimatedBudget || 0
    }));

    // Get procurement methods analysis
    const procurementMethods = await db.pPMPItem.groupBy({
      by: ['procurementMethod'],
      where: {
        ppmp: where
      },
      _count: {
        id: true
      },
      _sum: {
        totalCost: true
      }
    });

    const methodsData = procurementMethods.map(item => ({
      method: item.procurementMethod,
      count: item._count.id,
      totalValue: item._sum.totalCost || 0
    }));

    // Get top procurement items
    const topItems = await db.pPMPItem.findMany({
      where: {
        ppmp: where
      },
      select: {
        description: true,
        totalCost: true,
        procurementMethod: true
      },
      orderBy: {
        totalCost: 'desc'
      },
      take: 10
    });

    // Calculate utilized budget (from disbursement links)
    const linkedDisbursementIds = await db.pPMPDisbursementLink.findMany({
      where: {
        ppmp: where
      },
      select: {
        disbursementId: true
      }
    });

    const utilizedBudget = await db.disbursementVoucher.aggregate({
      where: {
        id: {
          in: linkedDisbursementIds.map(link => link.disbursementId)
        }
      },
      _sum: {
        amount: true
      }
    });

    const reportData = {
      summary: {
        totalPpmp,
        approvedPpmp,
        totalBudget: budgetSummary._sum.totalEstimatedBudget || 0,
        utilizedBudget: utilizedBudget._sum.amount || 0
      },
      byStatus,
      byDepartment,
      byFiscalYear,
      procurementMethods: methodsData,
      topItems
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating PPMP reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
