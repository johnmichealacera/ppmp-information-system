/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/consolidated-rfq - List Consolidated RFQs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const officeEmployeeId = searchParams.get('officeEmployeeId');

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (officeEmployeeId) where.officeEmployeeId = officeEmployeeId;

    const consolidatedPRs = await db.consolidatedPR.findMany({
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
            pr: {
              select: {
                id: true,
                prNo: true,
                status: true
              }
            },
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

    return NextResponse.json(consolidatedPRs);
  } catch (error) {
    console.error('Error fetching consolidated RFQs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/consolidated-rfq - Create new Consolidated RFQ
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
      consoNo,
      category,
      description,
      officeEmployeeId,
      products
    } = body;

    // Validate required fields
    if (!consoNo || !officeEmployeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: consoNo, officeEmployeeId' },
        { status: 400 }
      );
    }

    // Check if Consolidated RFQ number already exists
    const existing = await db.consolidatedPR.findFirst({
      where: { consoNo }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Consolidated RFQ with this number already exists' },
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

    const consolidatedPR = await db.consolidatedPR.create({
      data: {
        consoNo,
        category: category || null,
        description: description || null,
        officeEmployeeId,
        createdById: session.user.id,
        products: products ? {
          create: products.map((p: any) => ({
            prId: p.prId || null,
            unit: p.unit,
            qty: parseFloat(p.qty),
            ppmpProductId: p.ppmpProductId || null
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
            pr: {
              select: {
                id: true,
                prNo: true,
                status: true
              }
            },
            ppmpProduct: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(consolidatedPR, { status: 201 });
  } catch (error) {
    console.error('Error creating consolidated RFQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

