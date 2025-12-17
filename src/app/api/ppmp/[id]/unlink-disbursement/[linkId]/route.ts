import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// DELETE /api/ppmp/[id]/unlink-disbursement/[linkId] - Unlink PPMP from disbursement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, linkId } = await params;
    if (!session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Verify the link exists and belongs to this PPMP
    const link = await db.pPMPDisbursementLink.findUnique({
      where: { id: linkId },
      select: {
        id: true,
        ppmpId: true,
        ppmpItemId: true,
        disbursementId: true
      }
    });

    if (!link || link.ppmpId !== id) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Delete the link
    await db.pPMPDisbursementLink.delete({
      where: { id: linkId }
    });

    // Create audit trail
    await db.auditTrail.create({
      data: {
        action: 'UNLINK_DISBURSEMENT',
        entityType: 'PPMP',
        entityId: id,
        userId: session.user.id,
        oldValues: {
          unlinkedDisbursementId: link.disbursementId,
          unlinkedPpmpItemId: link.ppmpItemId
        }
      }
    });

    return NextResponse.json({ message: 'Disbursement unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking PPMP from disbursement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
