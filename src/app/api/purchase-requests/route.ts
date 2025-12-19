/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/purchase-requests - List Purchase Requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const officeEmployeeId = searchParams.get('officeEmployeeId');
    const ppmpAligned = searchParams.get('ppmpAligned');

    const where: any = {};

    if (status) where.status = status;
    if (officeEmployeeId) where.officeEmployeeId = officeEmployeeId;
    if (ppmpAligned !== null) where.ppmpAligned = ppmpAligned === 'true';

    const prs = await db.officePR.findMany({
      where,
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
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        products: {
          include: {
            ppmpProduct: {
              include: {
                product: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(prs);
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchase-requests - Create new Purchase Request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const {
      prNo,
      purpose,
      remarks,
      ppmpAligned,
      officeEmployeeId,
      products
    } = body;

    // Validate required fields
    if (!prNo || !officeEmployeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: prNo, officeEmployeeId' },
        { status: 400 }
      );
    }

    // Check if PR number already exists
    const existing = await db.officePR.findFirst({
      where: { prNo }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Purchase Request with this PR number already exists' },
        { status: 409 }
      );
    }

    // Verify office employee exists
    const officeEmployee = await db.officeEmployee.findUnique({
      where: { id: officeEmployeeId }
    });

    if (!officeEmployee) {
      return NextResponse.json(
        { error: 'Office Employee not found' },
        { status: 404 }
      );
    }

    const pr = await db.officePR.create({
      data: {
        prNo,
        purpose: purpose || null,
        remarks: remarks || null,
        ppmpAligned: ppmpAligned || false,
        officeEmployeeId,
        createdById: session.user.id,
        products: products ? {
          create: products.map((p: any) => ({
            ppmpProductId: p.ppmpProductId,
            unit: p.unit,
            qty: parseFloat(p.qty)
          }))
        } : undefined
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
        createdBy: {
          select: { id: true, name: true, email: true }
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

    return NextResponse.json(pr, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

