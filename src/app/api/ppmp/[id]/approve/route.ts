import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/ppmp/[id]/approve - Approve PPMP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true }
    });

    // Check if user has approval permissions
    if (!['PPMP_APPROVER', 'ADMIN', 'FINANCE_HEAD', 'MAYOR'].includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const ppmp = await db.pPMP.findUnique({
      where: { id },
      select: {
        status: true,
        departmentId: true,
        preparedById: true
      }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    if (ppmp.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Only submitted PPMPs can be approved' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { remarks } = body;

    // Update PPMP status to approved
    const updatedPpmp = await db.pPMP.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: session.user.id
      },
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create audit trail
    await db.auditTrail.create({
      data: {
        action: 'APPROVE',
        entityType: 'PPMP',
        entityId: id,
        userId: session.user.id,
        oldValues: { status: 'SUBMITTED' },
        newValues: {
          status: 'APPROVED',
          approvedById: session.user.id,
          remarks
        }
      }
    });

    // TODO: Send notification to PPMP preparer
    await db.notification.create({
      data: {
        type: 'ppmp_approved',
        title: 'PPMP Approved',
        message: `Your PPMP "${updatedPpmp.title}" has been approved.`,
        userId: updatedPpmp.preparedById
      }
    });

    return NextResponse.json(updatedPpmp);
  } catch (error) {
    console.error('Error approving PPMP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
