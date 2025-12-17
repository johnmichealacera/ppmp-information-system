import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/[id] - Get specific PPMP
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ppmp = await db.pPMP.findUnique({
      where: { id },
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        items: {
          include: {
            activities: true,
            disbursementLinks: {
              include: {
                disbursement: {
                  select: {
                    id: true,
                    payee: true,
                    amount: true,
                    status: true,
                    releaseDate: true
                  }
                }
              }
            }
          }
        },
        procurementActivities: true,
        budgetAllocations: true,
        disbursementLinks: {
          include: {
            disbursement: {
              select: {
                id: true,
                payee: true,
                amount: true,
                status: true,
                releaseDate: true
              }
            }
          }
        }
      }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true }
    });

    if (user?.role === 'PPMP_PREPARER' && user.department !== ppmp.departmentId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(ppmp);
  } catch (error) {
    console.error('Error fetching PPMP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/ppmp/[id] - Update PPMP
export async function PUT(
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
      select: { departmentId: true, preparedById: true, status: true }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    // Check permissions
    const canEdit = (
      user?.role === 'ADMIN' ||
      (user?.role === 'PPMP_PREPARER' &&
       user.department === ppmp.departmentId &&
       ppmp.status === 'DRAFT')
    );

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions or PPMP not editable' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      fiscalYear,
      totalEstimatedBudget,
      totalAllocatedBudget
    } = body;

    const updatedPpmp = await db.pPMP.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(fiscalYear && { fiscalYear: parseInt(fiscalYear) }),
        ...(totalEstimatedBudget !== undefined && { totalEstimatedBudget }),
        ...(totalAllocatedBudget !== undefined && { totalAllocatedBudget })
      },
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(updatedPpmp);
  } catch (error) {
    console.error('Error updating PPMP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ppmp/[id] - Delete PPMP
export async function DELETE(
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
      select: { departmentId: true, preparedById: true, status: true }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    // Only allow deletion of draft PPMPs by admins or the preparer
    const canDelete = (
      user?.role === 'ADMIN' ||
      (user?.role === 'PPMP_PREPARER' &&
       user.department === ppmp.departmentId &&
       ppmp.status === 'DRAFT')
    );

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions or PPMP not deletable' },
        { status: 403 }
      );
    }

    await db.pPMP.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'PPMP deleted successfully' });
  } catch (error) {
    console.error('Error deleting PPMP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
