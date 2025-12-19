/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/office-employees - List Office Employees
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get('officeId');
    const empId = searchParams.get('empId');

    const where: any = {};
    if (officeId) where.officeId = officeId;
    if (empId) where.empId = empId;

    const officeEmployees = await db.officeEmployee.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { office: { name: 'asc' } },
        { employee: { name: 'asc' } }
      ]
    });

    return NextResponse.json(officeEmployees);
  } catch (error) {
    console.error('Error fetching office employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/office-employees - Create Office Employee relationship
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
      select: { role: true }
    });

    // Only ADMIN can create office-employee relationships
    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { empId, officeId } = body;

    if (!empId || !officeId) {
      return NextResponse.json(
        { error: 'Missing required fields: empId, officeId' },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employee = await db.user.findUnique({
      where: { id: empId }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Verify office exists
    const office = await db.departmentDirectory.findUnique({
      where: { id: officeId }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    const officeEmployee = await db.officeEmployee.create({
      data: {
        empId,
        officeId
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json(officeEmployee, { status: 201 });
  } catch (error: any) {
    console.error('Error creating office employee:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Office-employee relationship already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

