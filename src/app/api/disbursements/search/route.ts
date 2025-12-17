/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/disbursements/search - Search disbursement vouchers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build search conditions
    const where: any = {};

    if (query.trim()) {
      where.OR = [
        { payee: { contains: query, mode: 'insensitive' } },
        { particulars: { contains: query, mode: 'insensitive' } },
        { id: { contains: query, mode: 'insensitive' } }
      ];
    }

    const disbursements = await db.disbursementVoucher.findMany({
      where,
      select: {
        id: true,
        payee: true,
        amount: true,
        status: true,
        particulars: true,
        releaseDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50) // Cap at 50 results
    });

    return NextResponse.json(disbursements);
  } catch (error) {
    console.error('Error searching disbursements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
