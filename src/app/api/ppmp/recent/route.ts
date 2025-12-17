/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/recent - Get recent PPMPs
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

    const recentPPMPs = await db.pPMP.findMany({
      where: whereClause,
      include: {
        department: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    return NextResponse.json(recentPPMPs);
  } catch (error) {
    console.error('Error fetching recent PPMPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
