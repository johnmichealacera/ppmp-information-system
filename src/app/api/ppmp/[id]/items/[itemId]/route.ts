/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/ppmp/[id]/items/[itemId] - Update PPMP item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
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

    const item = await db.pPMPItem.findUnique({
      where: { id: itemId },
      select: { ppmpId: true }
    });

    if (!item || item.ppmpId !== id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (itemNo !== undefined) updateData.itemNo = itemNo;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (unitCost !== undefined) updateData.unitCost = parseFloat(unitCost);
    if (procurementMethod !== undefined) updateData.procurementMethod = procurementMethod;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (remarks !== undefined) updateData.remarks = remarks;

    // Recalculate total cost if quantity or unitCost changed
    if (quantity !== undefined || unitCost !== undefined) {
      const currentItem = await db.pPMPItem.findUnique({
        where: { id: itemId },
        select: { quantity: true, unitCost: true }
      });

      const newQuantity = quantity !== undefined ? parseInt(quantity) : currentItem?.quantity;
      const newUnitCost = unitCost !== undefined ? parseFloat(unitCost) : Number(currentItem?.unitCost);

      updateData.totalCost = newQuantity! * newUnitCost;
    }

    const updatedItem = await db.pPMPItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        activities: true
      }
    });

    // Update PPMP total budget if total cost changed
    if (updateData.totalCost !== undefined) {
      const allItems = await db.pPMPItem.findMany({
        where: { ppmpId: id },
        select: { totalCost: true }
      });

      const newTotalEstimated = allItems.reduce((sum, item) => sum + Number(item.totalCost), 0);

      await db.pPMP.update({
        where: { id },
        data: { totalEstimatedBudget: newTotalEstimated }
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating PPMP item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ppmp/[id]/items/[itemId] - Delete PPMP item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
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

    const item = await db.pPMPItem.findUnique({
      where: { id: itemId },
      select: { ppmpId: true }
    });

    if (!item || item.ppmpId !== id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete the item
    await db.pPMPItem.delete({
      where: { id: itemId }
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

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting PPMP item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
