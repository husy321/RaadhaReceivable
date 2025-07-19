-- Receivables Tracker Database Schema
-- Run this in your Supabase SQL editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ewity_name TEXT,
  quickbooks_name TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receivables table
CREATE TABLE IF NOT EXISTS receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  po_number TEXT,
  customer_id UUID REFERENCES customers(id),
  order_date DATE,
  due_date DATE,
  original_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'overdue', 'paid')) DEFAULT 'pending',
  ewity_transaction_id TEXT,
  quickbooks_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id UUID REFERENCES receivables(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id UUID REFERENCES receivables(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('invoice', 'po', 'do', 'other')) DEFAULT 'other',
  file_name TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT,
  source_system TEXT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receivables_customer_id ON receivables(customer_id);
CREATE INDEX IF NOT EXISTS idx_receivables_status ON receivables(status);
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_receivable_id ON follow_ups(receivable_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_date ON follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_documents_receivable_id ON documents(receivable_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on receivables
CREATE TRIGGER update_receivables_updated_at BEFORE UPDATE ON receivables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO customers (id, name, ewity_name, quickbooks_name, contact_number, email, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ABC Manufacturing Ltd.', 'ABC Mfg', 'ABC Manufacturing Ltd.', '+65 6123 4567', 'finance@abcmfg.com', '2024-01-15T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Solutions', 'TechCorp', 'TechCorp Solutions Pte Ltd', '+65 6234 5678', 'accounts@techcorp.sg', '2024-02-01T09:00:00Z'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Trading Co.', 'Global Trading', 'Global Trading Co.', '+65 6345 6789', 'billing@globaltrading.com', '2024-02-15T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440004', 'Smart Electronics', 'Smart Electronics', 'Smart Electronics Pte Ltd', '+65 6456 7890', 'finance@smartelectronics.sg', '2024-03-01T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO receivables (id, receipt_number, po_number, customer_id, order_date, due_date, original_amount, balance_due, status, ewity_transaction_id, quickbooks_invoice_id, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'RCP-2024-001', 'PO-ABC-2024-100', '550e8400-e29b-41d4-a716-446655440001', '2024-06-01', '2024-07-01', 15000.00, 15000.00, 'overdue', 'EWT-001-2024', 'QB-INV-001', '2024-06-01T10:00:00Z', '2024-06-01T10:00:00Z'),
('650e8400-e29b-41d4-a716-446655440002', 'RCP-2024-002', 'PO-TECH-2024-050', '550e8400-e29b-41d4-a716-446655440002', '2024-06-15', '2024-07-15', 8500.00, 8500.00, 'pending', 'EWT-002-2024', 'QB-INV-002', '2024-06-15T14:00:00Z', '2024-06-15T14:00:00Z'),
('650e8400-e29b-41d4-a716-446655440003', 'RCP-2024-003', 'PO-GLB-2024-025', '550e8400-e29b-41d4-a716-446655440003', '2024-05-20', '2024-06-20', 22000.00, 22000.00, 'overdue', 'EWT-003-2024', 'QB-INV-003', '2024-05-20T09:00:00Z', '2024-05-20T09:00:00Z'),
('650e8400-e29b-41d4-a716-446655440004', 'RCP-2024-004', 'PO-SMT-2024-075', '550e8400-e29b-41d4-a716-446655440004', '2024-07-01', '2024-08-01', 12500.00, 12500.00, 'pending', 'EWT-004-2024', 'QB-INV-004', '2024-07-01T16:00:00Z', '2024-07-01T16:00:00Z'),
('650e8400-e29b-41d4-a716-446655440005', 'RCP-2024-005', 'PO-ABC-2024-150', '550e8400-e29b-41d4-a716-446655440001', '2024-05-01', '2024-06-01', 35000.00, 35000.00, 'overdue', 'EWT-005-2024', 'QB-INV-005', '2024-05-01T11:00:00Z', '2024-05-01T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO follow_ups (id, receivable_id, scheduled_date, completed, contacted_by, method, notes, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, false, 'Sarah Chen', 'call', 'Need to follow up on overdue payment', '2024-07-15T10:00:00Z'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, false, 'John Tan', 'email', 'Send payment reminder email', '2024-07-10T14:00:00Z'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '1 day', false, 'Sarah Chen', 'call', 'Check on payment status before due date', '2024-07-18T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON receivables FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON receivables FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON receivables FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON follow_ups FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON follow_ups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON follow_ups FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON documents FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON sync_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sync_logs FOR INSERT WITH CHECK (true);