import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/consolidated-rfq/[id] - Get specific Consolidated RFQ
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
    const consolidatedPR = await db.consolidatedPR.findUnique({
      where: { id },
      include: {
        officeEmployee: {
          include: {
            employee: {
              select: { id: true, name: true, email: true, role: true }
            },
            office: {
              select: { id: true, name: true, code: true }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        products: {
          include: {
            pr: {
              include: {
                officeEmployee: {
                  include: {
                    employee: {
                      select: { id: true, name: true }
                    },
                    office: {
                      select: { id: true, name: true }
                    }
                  }
                }
              }
            },
            ppmpProduct: {
              include: {
                product: true,
                ppmp: {
                  select: {
                    id: true,
                    title: true,
                    ppmpNo: true,
                    fiscalYear: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!consolidatedPR) {
      return NextResponse.json({ error: 'Consolidated RFQ not found' }, { status: 404 });
    }

    return NextResponse.json(consolidatedPR);
  } catch (error) {
    console.error('Error fetching consolidated RFQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/consolidated-rfq/[id] - Update Consolidated RFQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const consolidatedPR = await db.consolidatedPR.findUnique({
      where: { id },
      select: { status: true, createdById: true }
    });

    if (!consolidatedPR) {
      return NextResponse.json({ error: 'Consolidated RFQ not found' }, { status: 404 });
    }

    // Check permissions
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const canEdit = (
      user?.role === 'ADMIN' ||
      (consolidatedPR.status === 'DRAFT' && consolidatedPR.createdById === session.user.id)
    );

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions or Consolidated RFQ not editable' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, category, description } = body;

    const updated = await db.consolidatedPR.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description })
      },
      include: {
        officeEmployee: {
          include: {
            employee: {
              select: { id: true, name: true, email: true }
            },
            office: {
              select: { id: true, name: true }
            }
          }
        },
        products: {
          include: {
            pr: {
              select: {
                id: true,
                prNo: true,
                status: true
              }
            },
            ppmpProduct: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating consolidated RFQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/consolidated-rfq/[id] - Delete Consolidated RFQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const consolidatedPR = await db.consolidatedPR.findUnique({
      where: { id },
      select: { status: true, createdById: true }
    });

    if (!consolidatedPR) {
      return NextResponse.json({ error: 'Consolidated RFQ not found' }, { status: 404 });
    }

    // Check permissions
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const canDelete = (
      user?.role === 'ADMIN' ||
      (consolidatedPR.status === 'DRAFT' && consolidatedPR.createdById === session.user.id)
    );

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await db.consolidatedPR.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Consolidated RFQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting consolidated RFQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

