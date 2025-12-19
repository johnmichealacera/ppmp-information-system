import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/purchase-requests/[id] - Get specific Purchase Request
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
    const pr = await db.officePR.findUnique({
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
        },
        consoProducts: {
          include: {
            consoPr: {
              select: {
                id: true,
                consoNo: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!pr) {
      return NextResponse.json({ error: 'Purchase Request not found' }, { status: 404 });
    }

    return NextResponse.json(pr);
  } catch (error) {
    console.error('Error fetching purchase request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-requests/[id] - Update Purchase Request
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
    const pr = await db.officePR.findUnique({
      where: { id },
      select: { status: true, createdById: true }
    });

    if (!pr) {
      return NextResponse.json({ error: 'Purchase Request not found' }, { status: 404 });
    }

    // Check permissions - only creator or admin can edit draft PRs
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const canEdit = (
      user?.role === 'ADMIN' ||
      (pr.status === 'DRAFT' && pr.createdById === session.user.id)
    );

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions or PR not editable' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, purpose, remarks, ppmpAligned } = body;

    const updatedPr = await db.officePR.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(purpose !== undefined && { purpose }),
        ...(remarks !== undefined && { remarks }),
        ...(ppmpAligned !== undefined && { ppmpAligned })
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
            ppmpProduct: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedPr);
  } catch (error) {
    console.error('Error updating purchase request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/purchase-requests/[id] - Delete Purchase Request
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
    const pr = await db.officePR.findUnique({
      where: { id },
      select: { status: true, createdById: true }
    });

    if (!pr) {
      return NextResponse.json({ error: 'Purchase Request not found' }, { status: 404 });
    }

    // Check permissions
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const canDelete = (
      user?.role === 'ADMIN' ||
      (pr.status === 'DRAFT' && pr.createdById === session.user.id)
    );

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await db.officePR.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Purchase Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

