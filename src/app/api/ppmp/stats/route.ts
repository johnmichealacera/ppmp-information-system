/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/stats - Get PPMP statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true }
    });

    const whereClause: any = {};

    // Filter by department for PPMP_PREPARER role
    if (user?.role === 'PPMP_PREPARER' && user.department) {
      whereClause.departmentId = user.department;
    }

    // Get status counts
    const statusCounts = await db.pPMP.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    });

    // Transform to expected format
    const stats = {
      total: statusCounts.reduce((sum, item) => sum + item._count.status, 0),
      draft: statusCounts.find(item => item.status === 'DRAFT')?._count.status || 0,
      submitted: statusCounts.find(item => item.status === 'SUBMITTED')?._count.status || 0,
      approved: statusCounts.find(item => item.status === 'APPROVED')?._count.status || 0,
      rejected: statusCounts.find(item => item.status === 'REJECTED')?._count.status || 0,
      implemented: statusCounts.find(item => item.status === 'IMPLEMENTED')?._count.status || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching PPMP stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
