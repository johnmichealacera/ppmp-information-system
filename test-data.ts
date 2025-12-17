import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('Creating test PPMP data...');

  try {
    // Get existing departments
    const departments = await prisma.departmentDirectory.findMany();
    console.log(`Found ${departments.length} departments`);

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users with roles:`, users.map(u => u.role));

    // Check if we have the required roles
    const hasPPMPPreparer = users.some(u => u.role === 'PPMP_PREPARER');
    const hasPPMPApprover = users.some(u => u.role === 'PPMP_APPROVER');

    // Create PPMP users if they don't exist
    if (!hasPPMPPreparer) {
      console.log('Creating PPMP_PREPARER user...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'ppmp.preparer@test.com',
          name: 'PPMP Preparer',
          password: hashedPassword,
          role: 'PPMP_PREPARER',
          department: departments[0]?.code || 'GSO'
        }
      });
    }

    if (!hasPPMPApprover) {
      console.log('Creating PPMP_APPROVER user...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'ppmp.approver@test.com',
          name: 'PPMP Approver',
          password: hashedPassword,
          role: 'PPMP_APPROVER'
        }
      });
    }

    // Refresh user data
    const updatedUsers = await prisma.user.findMany();

    // Create test PPMP
    const preparerUser = updatedUsers.find(u => u.role === 'PPMP_PREPARER');
    if (!preparerUser) {
      throw new Error('No PPMP_PREPARER user found');
    }

    console.log('Creating test PPMP...');
    const testPPMP = await prisma.pPMP.upsert({
      where: { id: 'test-ppmp-1' },
      update: {},
      create: {
        id: 'test-ppmp-1',
        title: 'Test Office Supplies PPMP FY 2025',
        fiscalYear: 2025,
        departmentId: departments[0].id,
        preparedById: preparerUser.id,
        status: 'DRAFT',
        totalEstimatedBudget: 50000.00,
        totalAllocatedBudget: 45000.00,
        items: {
          create: [
            {
              category: 'GOODS',
              itemNo: 'TEST-001',
              description: 'Test Bond Paper A4',
              quantity: 50,
              unit: 'ream',
              unitCost: 200.00,
              totalCost: 10000.00,
              procurementMethod: 'SHOPPING',
              schedule: {
                startDate: '2025-01-01',
                endDate: '2025-03-01'
              },
              remarks: 'Test item for development'
            }
          ]
        }
      }
    });

    console.log('Test PPMP created:', testPPMP.id);
    console.log('Test data creation completed successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
