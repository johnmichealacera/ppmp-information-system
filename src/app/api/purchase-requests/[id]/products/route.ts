import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/purchase-requests/[id]/products - Get PR products
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
      select: { id: true }
    });

    if (!pr) {
      return NextResponse.json({ error: 'Purchase Request not found' }, { status: 404 });
    }

    const products = await db.officePRProduct.findMany({
      where: { prId: id },
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
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching PR products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchase-requests/[id]/products - Add product to PR
export async function POST(
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
    const { ppmpProductId, unit, qty } = body;

    if (!ppmpProductId || !unit || qty === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: ppmpProductId, unit, qty' },
        { status: 400 }
      );
    }

    // Verify PPMP product exists
    const ppmpProduct = await db.pPMPItem.findUnique({
      where: { id: ppmpProductId }
    });

    if (!ppmpProduct) {
      return NextResponse.json(
        { error: 'PPMP Product not found' },
        { status: 404 }
      );
    }

    const product = await db.officePRProduct.create({
      data: {
        prId: id,
        ppmpProductId,
        unit,
        qty: parseFloat(qty)
      },
      include: {
        ppmpProduct: {
          include: {
            product: true,
            ppmp: {
              select: {
                id: true,
                title: true,
                ppmpNo: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error adding product to PR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

