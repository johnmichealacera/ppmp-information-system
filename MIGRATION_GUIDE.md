# Database Migration Guide

## Prerequisites

- PostgreSQL database running and accessible
- `.env` file configured with `DATABASE_URL`
- Prisma client generated (✅ Already done)

## Migration Steps

### Step 1: Create Migration

Run the following command to create a new migration:

```bash
npm run db:migrate dev --name erd_alignment
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Update the Prisma client

### Step 2: Verify Migration

After migration, verify the new tables were created:

```sql
-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products',
  'office_employee',
  'office_ppmp',
  'expenditure_account',
  'office_expenditure',
  'office_pr',
  'office_pr_product',
  'consolidated_pr',
  'conso_pr_product'
);
```

### Step 3: Data Migration (Optional)

If you have existing data, you may want to migrate it:

#### Migrate Products from PPMP Items

```typescript
// prisma/migrate-products.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProducts() {
  console.log('Migrating products from PPMP items...');
  
  const items = await prisma.pPMPItem.findMany({
    where: { productId: null },
    select: { id: true, description: true }
  });

  for (const item of items) {
    const product = await prisma.product.upsert({
      where: { description: item.description },
      create: { description: item.description },
      update: {}
    });

    await prisma.pPMPItem.update({
      where: { id: item.id },
      data: { productId: product.id }
    });
  }

  console.log(`Migrated ${items.length} products`);
}

migrateProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### Create Office-Employee Relationships

```typescript
// prisma/migrate-office-employees.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOfficeEmployees() {
  console.log('Creating office-employee relationships...');
  
  const users = await prisma.user.findMany({
    where: { department: { not: null } },
    select: { id: true, department: true }
  });

  for (const user of users) {
    if (user.department) {
      await prisma.officeEmployee.upsert({
        where: {
          empId_officeId: {
            empId: user.id,
            officeId: user.department
          }
        },
        create: {
          empId: user.id,
          officeId: user.department
        },
        update: {}
      });
    }
  }

  console.log(`Created ${users.length} office-employee relationships`);
}

migrateOfficeEmployees()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Step 4: Seed Initial Data (Optional)

You can seed the database with initial data:

```bash
npm run db:seed
```

## Rollback (If Needed)

If you need to rollback the migration:

```bash
npm run db:migrate reset
```

**Warning**: This will delete all data in your database!

## Troubleshooting

### Migration Fails

1. Check database connection in `.env`
2. Ensure database user has CREATE TABLE permissions
3. Check for existing tables that might conflict
4. Review migration SQL in `prisma/migrations/[timestamp]_erd_alignment/migration.sql`

### Foreign Key Errors

If you get foreign key errors:
- Ensure existing data is valid
- Run data migration scripts first
- Check for orphaned records

### Column Type Mismatches

If you have existing data with incompatible types:
- The migration should handle this automatically
- Check the generated migration SQL
- Manually adjust if needed

## Next Steps

After successful migration:

1. ✅ Test API endpoints
2. ✅ Update frontend components
3. ✅ Test monthly allocation features
4. ✅ Test Purchase Request workflow
5. ✅ Test Consolidated RFQ workflow

## Verification Checklist

- [ ] Migration created successfully
- [ ] All new tables exist in database
- [ ] Prisma client updated
- [ ] API endpoints working
- [ ] Frontend components updated
- [ ] Data migration completed (if applicable)

