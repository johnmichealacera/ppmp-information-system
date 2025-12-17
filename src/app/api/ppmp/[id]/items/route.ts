import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/[id]/items - Get PPMP items
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
    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const ppmp = await db.pPMP.findUnique({
      where: { id },
      select: { id: true, departmentId: true, status: true }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
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

    const items = await db.pPMPItem.findMany({
      where: { ppmpId: id },
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
      },
      orderBy: { itemNo: 'asc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching PPMP items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ppmp/[id]/items - Add PPMP item
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

    const ppmp = await db.pPMP.findUnique({
      where: { id },
      select: { departmentId: true, status: true, preparedById: true }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    // Check permissions
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true }
    });

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
      category,
      itemNo,
      description,
      quantity,
      unit,
      unitCost,
      procurementMethod,
      schedule,
      remarks
    } = body;

    // Validate required fields
    if (!category || !itemNo || !description || !quantity || !unit || !unitCost || !procurementMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const totalCost = quantity * parseFloat(unitCost);

    const item = await db.pPMPItem.create({
      data: {
        ppmpId: id,
        category,
        itemNo,
        description,
        quantity: parseInt(quantity),
        unit,
        unitCost: parseFloat(unitCost),
        totalCost,
        procurementMethod,
        schedule: schedule || {},
        remarks
      },
      include: {
        activities: true
      }
    });

    // Update PPMP total budget
    const allItems = await db.pPMPItem.findMany({
      where: { ppmpId: id },
      select: { totalCost: true }
    });

    const newTotalEstimated = allItems.reduce((sum, item) => sum + Number(item.totalCost), 0);

    await db.pPMP.update({
      where: { id },
      data: { totalEstimatedBudget: newTotalEstimated }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating PPMP item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
