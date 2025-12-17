/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/ppmp/[id]/budget/[allocationId] - Update PPMP budget allocation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allocationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, allocationId } = await params;
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

    const allocation = await db.pPMPBudgetAllocation.findUnique({
      where: { id: allocationId },
      select: { ppmpId: true }
    });

    if (!allocation || allocation.ppmpId !== id) {
      return NextResponse.json({ error: 'Budget allocation not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      budgetCode,
      description,
      allocatedAmount
    } = body;

    const updateData: any = {};
    if (budgetCode !== undefined) updateData.budgetCode = budgetCode;
    if (description !== undefined) updateData.description = description;
    if (allocatedAmount !== undefined) {
      const amount = parseFloat(allocatedAmount);
      if (isNaN(amount) || amount < 0) {
        return NextResponse.json(
          { error: 'Invalid allocated amount' },
          { status: 400 }
        );
      }
      updateData.allocatedAmount = amount;
    }

    const updatedAllocation = await db.pPMPBudgetAllocation.update({
      where: { id: allocationId },
      data: updateData
    });

    // Update PPMP total allocated budget if allocated amount changed
    if (updateData.allocatedAmount !== undefined) {
      const allAllocations = await db.pPMPBudgetAllocation.findMany({
        where: { ppmpId: id },
        select: { allocatedAmount: true }
      });

      const newTotalAllocated = allAllocations.reduce((sum, alloc) => sum + Number(alloc.allocatedAmount), 0);

      await db.pPMP.update({
        where: { id },
        data: { totalAllocatedBudget: newTotalAllocated }
      });
    }

    return NextResponse.json(updatedAllocation);
  } catch (error) {
    console.error('Error updating PPMP budget allocation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ppmp/[id]/budget/[allocationId] - Delete PPMP budget allocation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allocationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, allocationId } = await params;
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

    const allocation = await db.pPMPBudgetAllocation.findUnique({
      where: { id: allocationId },
      select: { ppmpId: true }
    });

    if (!allocation || allocation.ppmpId !== id) {
      return NextResponse.json({ error: 'Budget allocation not found' }, { status: 404 });
    }

    // Delete the allocation
    await db.pPMPBudgetAllocation.delete({
      where: { id: allocationId }
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

    return NextResponse.json({ message: 'Budget allocation deleted successfully' });
  } catch (error) {
    console.error('Error deleting PPMP budget allocation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
