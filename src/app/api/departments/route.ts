import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/departments - Get all active departments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await db.departmentDirectory.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
