# PPMP Information System 🏛️

A comprehensive **Project Procurement Management Plan (PPMP)** system for Philippine government agencies, specifically designed for the Municipality of Socorro. This enterprise-grade application streamlines procurement planning, budget tracking, and integrates seamlessly with disbursement workflows.

![PPMP Dashboard](https://via.placeholder.com/800x400/1a365d/ffffff?text=PPMP+Dashboard+Preview)

## 📋 Overview

The PPMP Information System serves as the foundational procurement planning document for government agencies. It consolidates estimated budget allocations, procurement schedules, and activity timelines into Annual Procurement Plans (APPs), enabling cross-referencing of payments against planned procurements and supporting comprehensive Procurement Monitoring Reports (PMRs).

## ✨ Key Features

### 🏗️ Core Procurement Planning
- **Multi-step PPMP Creation Wizard** - Guided process for creating comprehensive procurement plans
- **Procurement Item Management** - Detailed line items with descriptions, quantities, costs, and procurement methods
- **Budget Allocation Tracking** - Real-time monitoring of estimated vs. actual expenditures
- **Procurement Activity Scheduling** - Timeline visualization and milestone tracking
- **Department-based Access Control** - Secure, role-based permissions system

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

### Core Models
- **PPMP** - Main procurement plan documents
- **PPMPItem** - Detailed procurement line items
- **PPMPProcurementActivity** - Procurement timeline and milestones
- **PPMPBudgetAllocation** - Budget tracking and allocations
- **PPMPDisbursementLink** - Integration with disbursement system

### Integration Models
- **User** - System users with role-based permissions
- **DepartmentDirectory** - Organizational structure
- **DisbursementVoucher** - Linked disbursement records
- **AuditTrail** - Complete activity logging

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
   - Define detailed line items
   - Specify quantities, unit costs, and procurement methods
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

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── ppmp/              # PPMP pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── ppmp/             # PPMP-specific components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication config
│   ├── db.ts             # Database client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript definitions
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
