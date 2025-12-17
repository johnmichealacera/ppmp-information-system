/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/ppmp - List PPMPs with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const fiscalYear = searchParams.get('fiscalYear');
    const departmentId = searchParams.get('departmentId');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear);
    if (departmentId) where.departmentId = departmentId;

    // Handle search functionality
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { name: { contains: search, mode: 'insensitive' } } },
        { preparedBy: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Add role-based filtering
    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true }
    });

    if (user?.role === 'PPMP_PREPARER' && user.department) {
      where.departmentId = user.department;
    }

    const ppmp = await db.pPMP.findMany({
      where,
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        },
        items: true,
        procurementActivities: true,
        budgetAllocations: true,
        _count: {
          select: {
            items: true,
            procurementActivities: true,
            disbursementLinks: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(ppmp);
  } catch (error) {
    console.error('Error fetching PPMPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ppmp - Create new PPMP
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true }
    });

    // Check if user has permission to create PPMP
    if (!['PPMP_PREPARER', 'ADMIN'].includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      fiscalYear,
      departmentId,
      totalEstimatedBudget,
      totalAllocatedBudget
    } = body;

    // Validate required fields
    if (!title || !fiscalYear || !departmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If user is a PPMP_PREPARER, they can only create PPMPs for their department
    if (user?.role === 'PPMP_PREPARER' && user.department !== departmentId) {
      return NextResponse.json(
        { error: 'Cannot create PPMP for different department' },
        { status: 403 }
      );
    }

    const ppmp = await db.pPMP.create({
      data: {
        title,
        fiscalYear: parseInt(fiscalYear),
        departmentId,
        preparedById: session.user.id,
        totalEstimatedBudget: totalEstimatedBudget || 0,
        totalAllocatedBudget: totalAllocatedBudget || 0
      },
      include: {
        department: true,
        preparedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(ppmp, { status: 201 });
  } catch (error) {
    console.error('Error creating PPMP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
