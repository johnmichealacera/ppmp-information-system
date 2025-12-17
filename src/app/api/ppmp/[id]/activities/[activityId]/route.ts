/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/ppmp/[id]/activities/[activityId] - Update PPMP activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, activityId } = await params;
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

    const activity = await db.pPMPProcurementActivity.findUnique({
      where: { id: activityId },
      select: { ppmpId: true }
    });

    if (!activity || activity.ppmpId !== id) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      activity: activityText,
      startDate,
      endDate,
      responsibleUnit,
      status,
      ppmpItemId
    } = body;

    const updateData: any = {};
    if (activityText !== undefined) updateData.activity = activityText;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (responsibleUnit !== undefined) updateData.responsibleUnit = responsibleUnit;
    if (status !== undefined) updateData.status = status;

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    if (ppmpItemId !== undefined) {
      if (ppmpItemId) {
        // Verify the item belongs to this PPMP
        const item = await db.pPMPItem.findUnique({
          where: { id: ppmpItemId },
          select: { ppmpId: true }
        });

        if (!item || item.ppmpId !== id) {
          return NextResponse.json(
            { error: 'Invalid PPMP item' },
            { status: 400 }
          );
        }
      }

      updateData.ppmpItemId = ppmpItemId || null;
    }

    const updatedActivity = await db.pPMPProcurementActivity.update({
      where: { id: activityId },
      data: updateData,
      include: {
        ppmpItem: {
          select: {
            id: true,
            itemNo: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating PPMP activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ppmp/[id]/activities/[activityId] - Delete PPMP activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, activityId } = await params;
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

    const activity = await db.pPMPProcurementActivity.findUnique({
      where: { id: activityId },
      select: { ppmpId: true }
    });

    if (!activity || activity.ppmpId !== id) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Delete the activity
    await db.pPMPProcurementActivity.delete({
      where: { id: activityId }
    });

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting PPMP activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
