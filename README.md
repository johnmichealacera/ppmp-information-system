# PPMP Information System 🏛️

A comprehensive **Project Procurement Management Plan (PPMP)** system for Philippine government agencies, specifically designed for the Municipality of Socorro. This enterprise-grade application streamlines procurement planning, budget tracking, and integrates seamlessly with disbursement workflows.

![PPMP Dashboard](https://via.placeholder.com/800x400/1a365d/ffffff?text=PPMP+Dashboard+Preview)

## 📋 Overview

The PPMP Information System serves as the foundational procurement planning document for government agencies. It consolidates estimated budget allocations, procurement schedules, and activity timelines into Annual Procurement Plans (APPs), enabling cross-referencing of payments against planned procurements and supporting comprehensive Procurement Monitoring Reports (PMRs).

## ✨ Key Features

### 🏗️ Core Procurement Planning
- **Multi-step PPMP Creation Wizard** - Guided process for creating comprehensive procurement plans
- **Procurement Item Management** - Detailed line items with descriptions, quantities, costs, and procurement methods
- **Monthly Budget Allocation** - 12-month budget allocation tracking per item (ERD-compliant)
- **Product Master Catalog** - Centralized product management with reusable product definitions
- **Budget Allocation Tracking** - Real-time monitoring of estimated vs. actual expenditures
- **Procurement Activity Scheduling** - Timeline visualization and milestone tracking
- **Department-based Access Control** - Secure, role-based permissions system

### 📝 Purchase Request (PR) System
- **PR Creation from PPMP** - Generate Purchase Requests from approved PPMP items
- **PPMP Alignment Tracking** - Track which PRs are aligned with PPMP plans
- **PR Status Management** - Draft, Submitted, Approved, Rejected, Cancelled workflows
- **Item Linking** - Link PR products directly to PPMP products
- **Office-Employee Assignment** - Track PRs by office and employee relationships

### 📋 Consolidated RFQ System
- **Multi-PR Consolidation** - Consolidate multiple Purchase Requests into single RFQ
- **Direct PPMP Integration** - Add products directly from PPMP items
- **Category Management** - Organize RFQs by procurement category
- **Status Tracking** - Draft, Submitted, Approved, Rejected, Cancelled, Awarded
- **Comprehensive Product Linking** - Link to both PRs and PPMP items

### 🔄 Disbursement Integration
- **Seamless Budget Validation** - Automatic validation against PPMP allocations during disbursement creation
- **Item Auto-suggestion** - Smart linking of disbursement items to PPMP line items
- **Procurement Status Updates** - Real-time synchronization of procurement progress
- **Comprehensive Audit Trails** - Complete linkage of PPMP references in disbursement records

### 📊 Advanced Analytics & Reporting
- **Real-time Dashboard** - Executive overview with key metrics and status indicators
- **Procurement Monitoring Reports** - Comprehensive PMR generation with variance analysis
- **Department-wise Analytics** - Performance tracking across organizational units
- **Budget Utilization Dashboards** - Visual representation of expenditure patterns
- **Procurement Method Analytics** - Insights into procurement strategy effectiveness

### 👥 User Management & Workflow
- **Role-based Access Control** - Granular permissions for different user types
- **Approval Workflows** - Configurable multi-level approval processes
- **Notification System** - Automated alerts for procurement milestones and deadlines
- **Audit Logging** - Complete activity tracking for compliance and transparency

## 🏛️ Supported Procurement Methods

- **Competitive Bidding** - Open tendering for large-scale procurements
- **Shopping** - Simplified procurement for common use items
- **Negotiated Procurement** - Direct negotiation for specialized services
- **Direct Contracting** - Emergency and specialized procurements
- **Repeat Order** - Streamlined ordering from approved suppliers

## 🏢 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **PPMP_PREPARER** | Create and edit PPMPs for assigned department |
| **PPMP_APPROVER** | Review and approve submitted PPMPs |
| **PPMP_VIEWER** | Read-only access to PPMP data |
| **ADMIN** | Full system administration and configuration |

## 🛠️ Technical Architecture

### Frontend Stack
- **Next.js 15** - React framework with App Router
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **ShadCN/UI** - Modern component library
- **React Query** - Powerful data fetching and caching

### Backend Stack
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database
- **NextAuth.js** - Authentication and session management

### Key Technologies
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Query + Context API
- **Deployment**: Optimized for Vercel/Netlify

## 📊 Database Schema

### Core PPMP Models
- **PPMP** - Main procurement plan documents (with `ppmpNo` and `ppmpType` fields)
- **PPMPItem** - Detailed procurement line items with:
  - Product master table linkage (`productId`)
  - Monthly budget allocations (jan, feb, march, ..., dec - 12 columns)
  - Links to Purchase Requests and Consolidated RFQs
- **PPMPProcurementActivity** - Procurement timeline and milestones
- **PPMPBudgetAllocation** - Budget tracking and allocations
- **PPMPDisbursementLink** - Integration with disbursement system
- **OfficePPMP** - Links PPMPs to office-employee relationships

### Product & Master Data Models
- **Product** - Centralized product master catalog (ERD: `product`)
- **OfficeEmployee** - Many-to-many relationship between employees and offices (ERD: `office_employee`)
- **ExpenditureAccount** - Expenditure account classifications (ERD: `expenditure_account`)
- **OfficeExpenditure** - Office-specific expenditure appropriations (ERD: `office_expenditure`)

### Purchase Request Models
- **OfficePR** - Purchase Request documents (ERD: `office_pr`)
  - PR number, status, purpose, remarks
  - PPMP alignment tracking
  - Office-employee assignment
- **OfficePRProduct** - PR line items (ERD: `office_pr_product`)
  - Links to PPMP products
  - Quantity and unit tracking

### Consolidated RFQ Models
- **ConsolidatedPR** - Consolidated Request for Quotation (ERD: `consolidated_pr`)
  - RFQ number, category, status, description
  - Office-employee assignment
- **ConsolidatedPRProduct** - Consolidated RFQ products (ERD: `conso_pr_product`)
  - Links to Purchase Requests
  - Links to PPMP products
  - Quantity and unit tracking

### Integration Models
- **User** - System users with role-based permissions
- **DepartmentDirectory** - Organizational structure
- **DisbursementVoucher** - Linked disbursement records
- **AuditTrail** - Complete activity logging

### ERD Compliance
✅ **100% ERD Alignment** - All tables, columns, and relationships from the client's ERD diagram are fully implemented

## 🚀 API Endpoints

### PPMP Management
```
GET    /api/ppmp              # List PPMPs with filtering
POST   /api/ppmp              # Create new PPMP
GET    /api/ppmp/[id]         # Get specific PPMP
PUT    /api/ppmp/[id]         # Update PPMP
DELETE /api/ppmp/[id]         # Delete PPMP
```

### Workflow Management
```
POST   /api/ppmp/[id]/submit   # Submit for approval
POST   /api/ppmp/[id]/approve  # Approve PPMP
POST   /api/ppmp/[id]/reject   # Reject PPMP
```

### Item & Activity Management
```
GET    /api/ppmp/[id]/items           # Get PPMP items
POST   /api/ppmp/[id]/items           # Add PPMP item
PUT    /api/ppmp/[id]/items/[itemId]  # Update PPMP item
GET    /api/ppmp/[id]/activities      # Get procurement activities
POST   /api/ppmp/[id]/activities      # Add activity
```

### Analytics & Reporting
```
GET    /api/ppmp/stats         # PPMP statistics
GET    /api/ppmp/recent        # Recent PPMP activity
GET    /api/ppmp/reports       # Comprehensive reports
```

### Integration Endpoints
```
GET    /api/ppmp/[id]/disbursements     # Linked disbursements
POST   /api/ppmp/[id]/link-disbursement # Link to disbursement
```

### Product Management
```
GET    /api/products                    # List products (with search)
POST   /api/products                    # Create new product
```

### Purchase Request (PR) Management
```
GET    /api/purchase-requests           # List PRs with filtering
POST   /api/purchase-requests           # Create new PR
GET    /api/purchase-requests/[id]      # Get specific PR
PUT    /api/purchase-requests/[id]      # Update PR
DELETE /api/purchase-requests/[id]      # Delete PR
GET    /api/purchase-requests/[id]/products  # Get PR products
POST   /api/purchase-requests/[id]/products  # Add product to PR
```

### Consolidated RFQ Management
```
GET    /api/consolidated-rfq             # List Consolidated RFQs
POST   /api/consolidated-rfq             # Create new Consolidated RFQ
GET    /api/consolidated-rfq/[id]        # Get specific Consolidated RFQ
PUT    /api/consolidated-rfq/[id]        # Update Consolidated RFQ
DELETE /api/consolidated-rfq/[id]        # Delete Consolidated RFQ
```

### Office-Employee Management
```
GET    /api/office-employees             # List office-employee relationships
POST   /api/office-employees             # Create office-employee relationship
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ppmp-information-system.git
   cd ppmp-information-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ppmp_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating a PPMP

1. **Access the Dashboard**
   - Navigate to the main dashboard
   - Click "Create New PPMP"

2. **Basic Information**
   - Enter PPMP title and fiscal year
   - Select department and responsible personnel

3. **Add Procurement Items**
   - Select or create products from the master catalog
   - Define detailed line items with descriptions
   - Specify quantities, unit costs, and procurement methods
   - **Allocate budget across 12 months** (january through december)
   - Set procurement schedules and timelines

4. **Budget Allocation**
   - Allocate budget across different COA codes
   - Track estimated vs. committed amounts

5. **Submit for Approval**
   - Review complete PPMP
   - Submit for departmental approval

### Managing Approvals

1. **Access Approval Queue**
   - Navigate to "Approvals" section
   - Review pending PPMPs

2. **Review Process**
   - Examine procurement details
   - Check budget allocations
   - Approve or reject with comments

### Integration with Disbursements

1. **Link Existing PPMPs**
   - Access disbursement creation
   - Search and link to relevant PPMP items

2. **Budget Validation**
   - System automatically validates against PPMP budgets
   - Prevents overspending on allocated amounts

### Creating Purchase Requests

1. **From Approved PPMPs**
   - Navigate to Purchase Requests
   - Click "Create PR"
   - Select office and employee
   - Add items from approved PPMP items
   - Track PPMP alignment

2. **PR Management**
   - View all PRs with filtering and search
   - Track PR status (Draft, Submitted, Approved, etc.)
   - Link PR products to PPMP products
   - Manage PR items and quantities

### Creating Consolidated RFQs

1. **Consolidate Multiple PRs**
   - Navigate to Consolidated RFQ
   - Click "Create Consolidated RFQ"
   - Add products from multiple Purchase Requests
   - Or add products directly from PPMP items
   - Organize by category

2. **RFQ Management**
   - View all Consolidated RFQs
   - Track RFQ status and award status
   - Link to source PRs and PPMP items
   - Manage consolidated product lists

## 🔧 Development

### Project Structure
```
src/
├── app/                           # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ppmp/                 # PPMP endpoints
│   │   ├── products/             # Product management
│   │   ├── purchase-requests/    # Purchase Request endpoints
│   │   ├── consolidated-rfq/      # Consolidated RFQ endpoints
│   │   └── office-employees/      # Office-Employee management
│   ├── ppmp/                     # PPMP pages
│   └── layout.tsx                # Root layout
├── components/                    # Reusable components
│   ├── ppmp/                     # PPMP-specific components
│   │   ├── monthly-allocation-input.tsx  # Monthly budget allocation
│   │   ├── product-selector.tsx          # Product selection
│   │   └── item-manager.tsx              # Updated with ERD features
│   ├── purchase-requests/        # Purchase Request components
│   │   ├── list.tsx              # PR list view
│   │   └── form.tsx              # PR create/edit form
│   └── consolidated-rfq/         # Consolidated RFQ components
│       ├── list.tsx              # RFQ list view
│       └── form.tsx              # RFQ create/edit form
├── lib/                          # Utility functions
│   ├── auth.ts                   # Authentication config
│   ├── db.ts                     # Database client
│   └── utils.ts                  # Helper functions
└── types/                        # TypeScript definitions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:migrate   # Run migrations
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for quality checks

## 📈 Success Metrics

- ✅ **Reduced Budget Variances** - Better planning accuracy
- ✅ **Improved Procurement Timeline Adherence** - Enhanced scheduling
- ✅ **Enhanced Transparency** - Complete audit trails
- ✅ **Streamlined Approval Process** - Efficient workflows
- ✅ **Comprehensive Compliance** - Regulatory adherence
- ✅ **ERD Alignment** - 100% compliance with client's database schema
- ✅ **Monthly Budget Tracking** - Detailed 12-month allocation per item
- ✅ **Product Standardization** - Centralized product catalog
- ✅ **Complete Procurement Workflow** - PPMP → PR → Consolidated RFQ

## 🎯 ERD Implementation Status

### ✅ Fully Implemented Features

**Database Schema (100% ERD Compliant):**
- ✅ Product master table (`product`)
- ✅ Office-Employee junction table (`office_employee`)
- ✅ Office PPMP linking (`office_ppmp`)
- ✅ Expenditure account system (`expenditure_account`, `office_expenditure`)
- ✅ Purchase Request system (`office_pr`, `office_pr_product`)
- ✅ Consolidated RFQ system (`consolidated_pr`, `conso_pr_product`)
- ✅ Monthly allocation columns (jan-dec) in `ppmp_product`
- ✅ PPMP number and type fields (`ppmp_no`, `ppmp_type`)

**API Endpoints:**
- ✅ 7 new API route groups (Products, PR, Consolidated RFQ, Office-Employees)
- ✅ Full CRUD operations for all new entities
- ✅ Updated PPMP endpoints with new fields

**Frontend Components:**
- ✅ Monthly allocation input component
- ✅ Product selector with create functionality
- ✅ Purchase Request list and form components
- ✅ Consolidated RFQ list and form components
- ✅ Updated PPMP item manager with ERD features

**Verification:**
- ✅ 33/33 checks passed (100% verification)
- ✅ All tables, columns, and relationships verified
- ✅ All components and API routes verified

See [ERD_VERIFICATION_REPORT.md](./ERD_VERIFICATION_REPORT.md) for complete verification details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

For support and questions:
- 📧 Email: support@socorro.gov.ph
- 📖 Documentation: [Wiki](https://github.com/your-org/ppmp-information-system/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ppmp-information-system/issues)

## 🏛️ About Municipality of Socorro

The Municipality of Socorro is committed to transparent, efficient, and accountable governance. This PPMP Information System represents our dedication to modernizing procurement processes and ensuring optimal use of public resources.

---

**Built with ❤️ for transparent and efficient government procurement**
