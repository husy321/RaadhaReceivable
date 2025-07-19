export interface Customer {
  id: string
  name: string
  ewity_name?: string
  quickbooks_name?: string
  contact_number?: string
  email?: string
  created_at: string
}

export interface Receivable {
  id: string
  receipt_number: string
  po_number?: string
  customer_id: string
  customer: Customer
  order_date: string
  due_date: string
  original_amount: number
  balance_due: number
  status: 'pending' | 'overdue' | 'paid'
  ewity_transaction_id?: string
  quickbooks_invoice_id?: string
  created_at: string
  updated_at: string
  aging_days: number
}

export interface FollowUp {
  id: string
  receivable_id: string
  scheduled_date: string
  completed: boolean
  completed_date?: string
  contacted_by?: string
  method?: 'call' | 'email' | 'visit'
  notes?: string
  next_follow_up?: string
  created_at: string
}

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'ABC Manufacturing Ltd.',
    ewity_name: 'ABC Mfg',
    quickbooks_name: 'ABC Manufacturing Ltd.',
    contact_number: '+65 6123 4567',
    email: 'finance@abcmfg.com',
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'TechCorp Solutions',
    ewity_name: 'TechCorp',
    quickbooks_name: 'TechCorp Solutions Pte Ltd',
    contact_number: '+65 6234 5678',
    email: 'accounts@techcorp.sg',
    created_at: '2024-02-01T09:00:00Z'
  },
  {
    id: '3',
    name: 'Global Trading Co.',
    ewity_name: 'Global Trading',
    quickbooks_name: 'Global Trading Co.',
    contact_number: '+65 6345 6789',
    email: 'billing@globaltrading.com',
    created_at: '2024-02-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Smart Electronics',
    ewity_name: 'Smart Electronics',
    quickbooks_name: 'Smart Electronics Pte Ltd',
    contact_number: '+65 6456 7890',
    email: 'finance@smartelectronics.sg',
    created_at: '2024-03-01T11:00:00Z'
  }
]

const calculateAgingDays = (dueDate: string): number => {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

const getReceivableStatus = (agingDays: number): 'pending' | 'overdue' | 'paid' => {
  if (agingDays === 0) return 'pending'
  return agingDays > 0 ? 'overdue' : 'pending'
}

export const mockReceivables: Receivable[] = [
  {
    id: '1',
    receipt_number: 'RCP-2024-001',
    po_number: 'PO-ABC-2024-100',
    customer_id: '1',
    customer: mockCustomers[0],
    order_date: '2024-06-01',
    due_date: '2024-07-01',
    original_amount: 15000.00,
    balance_due: 15000.00,
    status: 'overdue',
    ewity_transaction_id: 'EWT-001-2024',
    quickbooks_invoice_id: 'QB-INV-001',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    aging_days: calculateAgingDays('2024-07-01')
  },
  {
    id: '2',
    receipt_number: 'RCP-2024-002',
    po_number: 'PO-TECH-2024-050',
    customer_id: '2',
    customer: mockCustomers[1],
    order_date: '2024-06-15',
    due_date: '2024-07-15',
    original_amount: 8500.00,
    balance_due: 8500.00,
    status: 'pending',
    ewity_transaction_id: 'EWT-002-2024',
    quickbooks_invoice_id: 'QB-INV-002',
    created_at: '2024-06-15T14:00:00Z',
    updated_at: '2024-06-15T14:00:00Z',
    aging_days: calculateAgingDays('2024-07-15')
  },
  {
    id: '3',
    receipt_number: 'RCP-2024-003',
    po_number: 'PO-GLB-2024-025',
    customer_id: '3',
    customer: mockCustomers[2],
    order_date: '2024-05-20',
    due_date: '2024-06-20',
    original_amount: 22000.00,
    balance_due: 22000.00,
    status: 'overdue',
    ewity_transaction_id: 'EWT-003-2024',
    quickbooks_invoice_id: 'QB-INV-003',
    created_at: '2024-05-20T09:00:00Z',
    updated_at: '2024-05-20T09:00:00Z',
    aging_days: calculateAgingDays('2024-06-20')
  },
  {
    id: '4',
    receipt_number: 'RCP-2024-004',
    po_number: 'PO-SMT-2024-075',
    customer_id: '4',
    customer: mockCustomers[3],
    order_date: '2024-07-01',
    due_date: '2024-08-01',
    original_amount: 12500.00,
    balance_due: 12500.00,
    status: 'pending',
    ewity_transaction_id: 'EWT-004-2024',
    quickbooks_invoice_id: 'QB-INV-004',
    created_at: '2024-07-01T16:00:00Z',
    updated_at: '2024-07-01T16:00:00Z',
    aging_days: calculateAgingDays('2024-08-01')
  },
  {
    id: '5',
    receipt_number: 'RCP-2024-005',
    po_number: 'PO-ABC-2024-150',
    customer_id: '1',
    customer: mockCustomers[0],
    order_date: '2024-05-01',
    due_date: '2024-06-01',
    original_amount: 35000.00,
    balance_due: 35000.00,
    status: 'overdue',
    ewity_transaction_id: 'EWT-005-2024',
    quickbooks_invoice_id: 'QB-INV-005',
    created_at: '2024-05-01T11:00:00Z',
    updated_at: '2024-05-01T11:00:00Z',
    aging_days: calculateAgingDays('2024-06-01')
  }
]

// Update status based on aging
mockReceivables.forEach(receivable => {
  receivable.status = getReceivableStatus(receivable.aging_days)
})

export const mockFollowUps: FollowUp[] = [
  {
    id: '1',
    receivable_id: '1',
    scheduled_date: '2024-07-19',
    completed: false,
    contacted_by: 'Sarah Chen',
    method: 'call',
    notes: 'Need to follow up on overdue payment',
    created_at: '2024-07-15T10:00:00Z'
  },
  {
    id: '2',
    receivable_id: '3',
    scheduled_date: '2024-07-19',
    completed: false,
    contacted_by: 'John Tan',
    method: 'email',
    notes: 'Send payment reminder email',
    created_at: '2024-07-10T14:00:00Z'
  },
  {
    id: '3',
    receivable_id: '2',
    scheduled_date: '2024-07-20',
    completed: false,
    contacted_by: 'Sarah Chen',
    method: 'call',
    notes: 'Check on payment status before due date',
    created_at: '2024-07-18T09:00:00Z'
  }
]

export const getDashboardStats = () => {
  const totalOutstanding = mockReceivables.reduce((sum, r) => sum + r.balance_due, 0)
  const overdueCount = mockReceivables.filter(r => r.status === 'overdue').length
  const collectionRate = 0.85 // Mock collection rate for this month
  const upcomingFollowUps = mockFollowUps.filter(f => !f.completed).length

  const agingBuckets = {
    '0-30': mockReceivables.filter(r => r.aging_days >= 0 && r.aging_days <= 30).reduce((sum, r) => sum + r.balance_due, 0),
    '31-60': mockReceivables.filter(r => r.aging_days >= 31 && r.aging_days <= 60).reduce((sum, r) => sum + r.balance_due, 0),
    '61-90': mockReceivables.filter(r => r.aging_days >= 61 && r.aging_days <= 90).reduce((sum, r) => sum + r.balance_due, 0),
    '90+': mockReceivables.filter(r => r.aging_days > 90).reduce((sum, r) => sum + r.balance_due, 0)
  }

  return {
    totalOutstanding,
    overdueCount,
    collectionRate,
    upcomingFollowUps,
    agingBuckets
  }
}