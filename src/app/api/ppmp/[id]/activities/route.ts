/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp/[id]/activities - Get PPMP activities
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

    const activities = await db.pPMPProcurementActivity.findMany({
      where: { ppmpId: id },
      include: {
        ppmpItem: {
          select: {
            id: true,
            itemNo: true,
            description: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching PPMP activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ppmp/[id]/activities - Add PPMP activity
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
      activity,
      startDate,
      endDate,
      responsibleUnit,
      status,
      ppmpItemId
    } = body;

    // Validate required fields
    if (!activity || !startDate || !endDate || !responsibleUnit || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const activityData: any = {
      ppmpId: id,
      activity,
      startDate: start,
      endDate: end,
      responsibleUnit,
      status
    };

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

      activityData.ppmpItemId = ppmpItemId;
    }

    const createdActivity = await db.pPMPProcurementActivity.create({
      data: activityData,
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

    return NextResponse.json(createdActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating PPMP activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
