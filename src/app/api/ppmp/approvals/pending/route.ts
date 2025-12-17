import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/approvals/pending - Get PPMPs pending approval
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
      select: { role: true }
    });

    // Check if user has approval permissions
    if (!['PPMP_APPROVER', 'ADMIN', 'FINANCE_HEAD', 'MAYOR'].includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const pendingPpmp = await db.pPMP.findMany({
      where: {
        status: 'SUBMITTED'
      },
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            items: true,
            procurementActivities: true,
            disbursementLinks: true
          }
        }
      },
      orderBy: { updatedAt: 'asc' } // Oldest first
    });

    return NextResponse.json(pendingPpmp);
  } catch (error) {
    console.error('Error fetching pending PPMP approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
