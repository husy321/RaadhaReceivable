# Claude Code Prompt: Build Receivables Tracking App

## Project Overview
Create a modern receivables tracking web application using Next.js 14 (App Router), React 18, TypeScript, and shadcn/ui components. The app will replace a manual Excel-based system with automated features for invoice tracking, payment follow-ups, and three-way integration between Ewity POS, QuickBooks Online, and the receivables system.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: shadcn/ui (already installed - see attached components)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useReducer)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

## Core Features to Implement

### 1. Dashboard Page (`app/dashboard/page.tsx`)
- Summary cards showing:
  - Total outstanding amount
  - Number of overdue invoices
  - Collection rate this month
  - Upcoming follow-ups count
- Aging chart (0-30, 31-60, 61-90, 90+ days)
- Recent activities feed
- Quick actions section

### 2. Receivables List Page (`app/receivables/page.tsx`)
- Table with columns:
  - Receipt # (from Ewity)
  - PO Number
  - Customer Name
  - Balance Due
  - Aging (days)
  - Status (paid/pending/overdue)
  - Last Contact
  - Actions (call, email, add note)
- Filters: status, aging range, customer
- Search functionality
- Bulk actions support

### 3. Receivable Detail Page (`app/receivables/[id]/page.tsx`)
- Customer information section
- Invoice details
- Document viewer (PO, DO, invoices)
- Communication timeline
- Follow-up scheduler
- Payment recording interface

### 4. Integration Settings Page (`app/settings/integrations/page.tsx`)
- Ewity POS connection status
- QuickBooks Online connection status
- Sync logs viewer
- Manual sync trigger
- Customer mapping interface

## Database Schema (Supabase)

```sql
-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ewity_name TEXT,
  quickbooks_name TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receivables table
CREATE TABLE receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  po_number TEXT,
  customer_id UUID REFERENCES customers(id),
  order_date DATE,
  due_date DATE,
  original_amount DECIMAL(10,2),
  balance_due DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'overdue', 'paid')),
  ewity_transaction_id TEXT,
  quickbooks_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id UUID REFERENCES receivables(id),
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  contacted_by TEXT,
  method TEXT CHECK (method IN ('call', 'email', 'visit')),
  notes TEXT,
  next_follow_up DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id UUID REFERENCES receivables(id),
  type TEXT CHECK (type IN ('invoice', 'po', 'do', 'other')),
  file_name TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync logs table
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT,
  source_system TEXT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## UI Implementation Guidelines

### 1. Update the Sidebar (`components/app-sidebar.tsx`)
Replace the existing navigation items with:
- Dashboard (Home icon)
- Receivables (FileText icon)
  - All Receivables
  - Overdue
  - Follow-ups Today
- Reports (PieChart icon)
  - Aging Report
  - Collection Summary
- Settings (Settings2 icon)
  - Integrations
  - Users
  - Company Info

### 2. Create Reusable Components
- `ReceivablesTable`: Data table with sorting, filtering
- `CustomerCard`: Display customer info
- `DocumentUploader`: Drag-drop file upload
- `FollowUpModal`: Schedule follow-ups
- `PaymentRecorder`: Record payments with QB sync
- `SyncStatusIndicator`: Show integration status

## Integration Implementation

### 1. Ewity POS Integration (`lib/ewity.ts`)
- OAuth2 authentication flow
- Daily sync job (cron at 00:01)
- Webhook handler for real-time updates
- Functions:
  - `fetchPendingPayments()`
  - `updatePaymentStatus()`
  - `syncCustomers()`

### 2. QuickBooks Integration (`lib/quickbooks.ts`)
- OAuth2 connection
- Invoice creation if not exists
- Payment recording
- Functions:
  - `createInvoice()`
  - `recordPayment()`
  - `matchCustomer()`

### 3. Sync Service (`lib/sync-service.ts`)
- Orchestrate three-way sync
- Handle conflicts
- Retry failed syncs
- Log all operations

## API Routes (Next.js App Router)

```
app/api/
├── auth/
│   └── callback/route.ts
├── receivables/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PUT, DELETE)
├── sync/
│   ├── ewity/route.ts
│   ├── quickbooks/route.ts
│   └── manual/route.ts
├── webhooks/
│   ├── ewity/route.ts
│   └── quickbooks/route.ts
└── documents/
    └── upload/route.ts
```

## Key Implementation Notes

1. **Customer Matching**: Use fuzzy string matching (90% threshold) for customer names across systems
2. **Partial Payments**: Keep original payment method, update balance to remaining amount
3. **Error Recovery**: Store failed syncs in queue, retry on next sync with exponential backoff
4. **Real-time Updates**: Use Supabase real-time subscriptions for live UI updates
5. **File Storage**: Use Supabase Storage for document uploads with proper access control

## First Steps
1. Set up the Next.js project with TypeScript
2. Install and configure Supabase
3. Create the database schema
4. Implement authentication flow
5. Build the dashboard page
6. Create the receivables list with mock data
7. Add Ewity integration
8. Add QuickBooks integration
9. Implement three-way sync logic
10. Add document management

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
EWITY_CLIENT_ID=
EWITY_CLIENT_SECRET=
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
```

Start by creating the project structure and implementing the dashboard page with mock data, then progressively add the integration features.