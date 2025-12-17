import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/[id]/budget - Get PPMP budget allocations
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

    const budgetAllocations = await db.pPMPBudgetAllocation.findMany({
      where: { ppmpId: id },
      orderBy: { budgetCode: 'asc' }
    });

    return NextResponse.json(budgetAllocations);
  } catch (error) {
    console.error('Error fetching PPMP budget allocations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ppmp/[id]/budget - Add PPMP budget allocation
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
      budgetCode,
      description,
      allocatedAmount
    } = body;

    // Validate required fields
    if (!budgetCode || !description || allocatedAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const amount = parseFloat(allocatedAmount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid allocated amount' },
        { status: 400 }
      );
    }

    const budgetAllocation = await db.pPMPBudgetAllocation.create({
      data: {
        ppmpId: id,
        budgetCode,
        description,
        allocatedAmount: amount
      }
    });

    // Update PPMP total allocated budget
    const allAllocations = await db.pPMPBudgetAllocation.findMany({
      where: { ppmpId: id },
      select: { allocatedAmount: true }
    });

    const newTotalAllocated = allAllocations.reduce((sum, alloc) => sum + Number(alloc.allocatedAmount), 0);

    await db.pPMP.update({
      where: { id },
      data: { totalAllocatedBudget: newTotalAllocated }
    });

    return NextResponse.json(budgetAllocation, { status: 201 });
  } catch (error) {
    console.error('Error creating PPMP budget allocation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
