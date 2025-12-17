import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/ppmp/[id]/submit - Submit PPMP for approval
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

    const ppmp = await db.pPMP.findUnique({
      where: { id },
      select: {
        departmentId: true,
        preparedById: true,
        status: true,
        items: true,
        budgetAllocations: true
      }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    // Check permissions - only the preparer or admin can submit
    const canSubmit = (
      user?.role === 'ADMIN' ||
      (user?.role === 'PPMP_PREPARER' &&
       user.department === ppmp.departmentId &&
       ppmp.preparedById === session.user.id)
    );

    if (!canSubmit) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate PPMP has required data before submission
    if (ppmp.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft PPMPs can be submitted' },
        { status: 400 }
      );
    }

    if (ppmp.items.length === 0) {
      return NextResponse.json(
        { error: 'PPMP must have at least one item' },
        { status: 400 }
      );
    }

    if (ppmp.budgetAllocations.length === 0) {
      return NextResponse.json(
        { error: 'PPMP must have budget allocations' },
        { status: 400 }
      );
    }

    // Update PPMP status to submitted
    const updatedPpmp = await db.pPMP.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create audit trail
    await db.auditTrail.create({
      data: {
        action: 'SUBMIT',
        entityType: 'PPMP',
        entityId: id,
        userId: session.user.id,
        newValues: { status: 'SUBMITTED' }
      }
    });

    // TODO: Send notifications to approvers
    // This would typically involve finding users with PPMP_APPROVER role
    // and creating notification records

    return NextResponse.json(updatedPpmp);
  } catch (error) {
    console.error('Error submitting PPMP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
