import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPPMPIntegration() {
  console.log('Testing PPMP-Disbursement Integration...');

  try {
    // Get existing PPMP and users
    const ppmp = await prisma.pPMP.findFirst();
    const ppmpItem = await prisma.pPMPItem.findFirst();
    const user = await prisma.user.findFirst();

    if (!ppmp || !ppmpItem || !user) {
      console.log('Missing required data for integration test');
      return;
    }

    console.log('Found PPMP:', ppmp.id);
    console.log('Found PPMP Item:', ppmpItem.id);
    console.log('Found User:', user.id);

    // Create a test disbursement voucher
    const testVoucher = await prisma.disbursementVoucher.create({
      data: {
        payee: 'Test Supplier',
        address: 'Test Address',
        amount: 5000.00,
        particulars: 'Test procurement from PPMP',
        tags: ['test'],
        sourceOffice: ['GSO'],
        status: 'DRAFT',
        createdById: user.id,
        assignedToId: user.id
      }
    });

    console.log('Created test disbursement voucher:', testVoucher.id);

    // Create a disbursement item
    const testItem = await prisma.disbursementItem.create({
      data: {
        description: 'Test Item from PPMP',
        quantity: 10,
        unit: 'pcs',
        unitPrice: 500.00,
        totalPrice: 5000.00,
        disbursementVoucherId: testVoucher.id
      }
    });

    console.log('Created test disbursement item:', testItem.id);

    // Link the PPMP item to the disbursement
    const link = await prisma.pPMPDisbursementLink.create({
      data: {
        ppmpId: ppmp.id,
        ppmpItemId: ppmpItem.id,
        disbursementId: testVoucher.id
      }
    });

    console.log('Created PPMP-Disbursement link:', link.id);

    // Verify the integration by querying linked data
    const linkedPPMP = await prisma.pPMP.findUnique({
      where: { id: ppmp.id },
      include: {
        disbursementLinks: {
          include: {
            disbursement: true,
            ppmpItem: true
          }
        }
      }
    });

    console.log('PPMP with disbursement links:', JSON.stringify(linkedPPMP, null, 2));

    console.log('PPMP-Disbursement integration test completed successfully!');

  } catch (error) {
    console.error('Error testing integration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPPMPIntegration();
