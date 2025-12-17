import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/ppmp/[id]/link-disbursement - Link PPMP to disbursement voucher
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
      select: { id: true, status: true }
    });

    if (!ppmp) {
      return NextResponse.json({ error: 'PPMP not found' }, { status: 404 });
    }

    // Only approved PPMPs can be linked to disbursements
    if (ppmp.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved PPMPs can be linked to disbursements' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { disbursementId, ppmpItemId } = body;

    if (!disbursementId || !ppmpItemId) {
      return NextResponse.json(
        { error: 'Disbursement ID and PPMP Item ID are required' },
        { status: 400 }
      );
    }

    // Verify the disbursement exists
    const disbursement = await db.disbursementVoucher.findUnique({
      where: { id: disbursementId },
      select: { id: true, status: true }
    });

    if (!disbursement) {
      return NextResponse.json({ error: 'Disbursement not found' }, { status: 404 });
    }

    // Verify the PPMP item exists and belongs to this PPMP
    const ppmpItem = await db.pPMPItem.findUnique({
      where: { id: ppmpItemId },
      select: { id: true, ppmpId: true }
    });

    if (!ppmpItem || ppmpItem.ppmpId !== id) {
      return NextResponse.json({ error: 'PPMP item not found' }, { status: 404 });
    }

    // Check if this link already exists
    const existingLink = await db.pPMPDisbursementLink.findUnique({
      where: {
        ppmpId_ppmpItemId_disbursementId: {
          ppmpId: id,
          ppmpItemId: ppmpItemId,
          disbursementId: disbursementId
        }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'This PPMP item is already linked to this disbursement' },
        { status: 400 }
      );
    }

    // Create the link
    const link = await db.pPMPDisbursementLink.create({
      data: {
        ppmpId: id,
        ppmpItemId: ppmpItemId,
        disbursementId: disbursementId
      },
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
    });

    // Create audit trail
    await db.auditTrail.create({
      data: {
        action: 'LINK_DISBURSEMENT',
        entityType: 'PPMP',
        entityId: id,
        userId: session.user.id,
        newValues: {
          linkedDisbursementId: disbursementId,
          linkedPpmpItemId: ppmpItemId
        }
      }
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error linking PPMP to disbursement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
