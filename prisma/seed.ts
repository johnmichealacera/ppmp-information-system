import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PPMP database...');

  // Create departments
  const departments = await Promise.all([
    prisma.departmentDirectory.upsert({
      where: { code: 'GSO' },
      update: {},
      create: {
        name: 'General Services Office',
        code: 'GSO'
      }
    }),
    prisma.departmentDirectory.upsert({
      where: { code: 'HR' },
      update: {},
      create: {
        name: 'Human Resources',
        code: 'HR'
      }
    }),
    prisma.departmentDirectory.upsert({
      where: { code: 'FIN' },
      update: {},
      create: {
        name: 'Finance Department',
        code: 'FIN'
      }
    }),
    prisma.departmentDirectory.upsert({
      where: { code: 'ENG' },
      update: {},
      create: {
        name: 'Engineering Department',
        code: 'ENG'
      }
    })
  ]);

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@socorro.gov.ph' },
      update: {},
      create: {
        email: 'admin@socorro.gov.ph',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN'
      }
    }),
    prisma.user.upsert({
      where: { email: 'ppmp.gso@socorro.gov.ph' },
      update: {},
      create: {
        email: 'ppmp.gso@socorro.gov.ph',
        name: 'GSO PPMP Preparer',
        password: hashedPassword,
        role: 'PPMP_PREPARER',
        department: departments[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'ppmp.hr@socorro.gov.ph' },
      update: {},
      create: {
        email: 'ppmp.hr@socorro.gov.ph',
        name: 'HR PPMP Preparer',
        password: hashedPassword,
        role: 'PPMP_PREPARER',
        department: departments[1].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'approver@socorro.gov.ph' },
      update: {},
      create: {
        email: 'approver@socorro.gov.ph',
        name: 'PPMP Approver',
        password: hashedPassword,
        role: 'PPMP_APPROVER'
      }
    })
  ]);

  // Create sample PPMPs
  const ppmp1 = await prisma.pPMP.create({
    data: {
      title: 'Office Supplies Procurement Plan FY 2025',
      fiscalYear: 2025,
      departmentId: departments[0].id, // GSO
      preparedById: users[1].id, // GSO PPMP Preparer
      status: 'APPROVED',
      totalEstimatedBudget: 150000.00,
      totalAllocatedBudget: 150000.00,
      items: {
        create: [
          {
            category: 'GOODS',
            itemNo: 'GSO-001',
            description: 'Bond Paper A4 (500 sheets/pack)',
            quantity: 100,
            unit: 'pack',
            unitCost: 250.00,
            totalCost: 25000.00,
            procurementMethod: 'SHOPPING',
            schedule: {
              startDate: '2025-01-15',
              endDate: '2025-02-15',
              procurementStart: '2025-01-15',
              procurementEnd: '2025-01-30',
              deliveryDate: '2025-02-15'
            },
            remarks: 'Regular office supply'
          },
          {
            category: 'GOODS',
            itemNo: 'GSO-002',
            description: 'Ballpoint Pens (black, 12/pack)',
            quantity: 50,
            unit: 'pack',
            unitCost: 120.00,
            totalCost: 6000.00,
            procurementMethod: 'SHOPPING',
            schedule: {
              startDate: '2025-01-15',
              endDate: '2025-02-15',
              procurementStart: '2025-01-15',
              procurementEnd: '2025-01-30',
              deliveryDate: '2025-02-15'
            },
            remarks: 'Standard office pens'
          }
        ]
      },
      budgetAllocations: {
        create: [
          {
            budgetCode: '101-001-001',
            description: 'Office Supplies Budget',
            allocatedAmount: 150000.00
          }
        ]
      }
    }
  });

  const ppmp2 = await prisma.pPMP.create({
    data: {
      title: 'IT Equipment Procurement Plan FY 2025',
      fiscalYear: 2025,
      departmentId: departments[0].id, // GSO
      preparedById: users[1].id, // GSO PPMP Preparer
      status: 'SUBMITTED',
      totalEstimatedBudget: 500000.00,
      totalAllocatedBudget: 450000.00,
      items: {
        create: [
          {
            category: 'GOODS',
            itemNo: 'IT-001',
            description: 'Desktop Computer (Core i5)',
            quantity: 5,
            unit: 'unit',
            unitCost: 25000.00,
            totalCost: 125000.00,
            procurementMethod: 'COMPETITIVE_BIDDING',
            schedule: {
              startDate: '2025-03-01',
              endDate: '2025-05-30',
              procurementStart: '2025-03-01',
              procurementEnd: '2025-04-15',
              deliveryDate: '2025-05-30'
            },
            remarks: 'For administrative offices'
          },
          {
            category: 'GOODS',
            itemNo: 'IT-002',
            description: 'LED Monitor 24"',
            quantity: 5,
            unit: 'unit',
            unitCost: 8000.00,
            totalCost: 40000.00,
            procurementMethod: 'COMPETITIVE_BIDDING',
            schedule: {
              startDate: '2025-03-01',
              endDate: '2025-05-30',
              procurementStart: '2025-03-01',
              procurementEnd: '2025-04-15',
              deliveryDate: '2025-05-30'
            },
            remarks: 'Matching monitors for computers'
          }
        ]
      },
      budgetAllocations: {
        create: [
          {
            budgetCode: '101-002-001',
            description: 'IT Equipment Budget',
            allocatedAmount: 450000.00
          }
        ]
      }
    }
  });

  const ppmp3 = await prisma.pPMP.create({
    data: {
      title: 'HR Training Program FY 2025',
      fiscalYear: 2025,
      departmentId: departments[1].id, // HR
      preparedById: users[2].id, // HR PPMP Preparer
      status: 'DRAFT',
      totalEstimatedBudget: 200000.00,
      totalAllocatedBudget: 0.00,
      items: {
        create: [
          {
            category: 'CONSULTING_SERVICES',
            itemNo: 'HR-001',
            description: 'Leadership Training Program',
            quantity: 1,
            unit: 'program',
            unitCost: 150000.00,
            totalCost: 150000.00,
            procurementMethod: 'NEGOTIATED_PROCUREMENT',
            schedule: {
              startDate: '2025-06-01',
              endDate: '2025-08-31',
              procurementStart: '2025-06-01',
              procurementEnd: '2025-07-15',
              deliveryDate: '2025-08-31'
            },
            remarks: 'For managerial staff development'
          }
        ]
      }
    }
  });

  console.log('PPMP database seeded successfully!');
  console.log(`Created ${departments.length} departments`);
  console.log(`Created ${users.length} users`);
  console.log(`Created ${3} PPMPs with items and budget allocations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
