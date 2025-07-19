// Supabase Database Types
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          ewity_name: string | null
          quickbooks_name: string | null
          contact_number: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          ewity_name?: string | null
          quickbooks_name?: string | null
          contact_number?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          ewity_name?: string | null
          quickbooks_name?: string | null
          contact_number?: string | null
          email?: string | null
          created_at?: string
        }
      }
      receivables: {
        Row: {
          id: string
          receipt_number: string
          po_number: string | null
          customer_id: string | null
          order_date: string | null
          due_date: string | null
          original_amount: number
          balance_due: number
          status: 'pending' | 'overdue' | 'paid'
          ewity_transaction_id: string | null
          quickbooks_invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          po_number?: string | null
          customer_id?: string | null
          order_date?: string | null
          due_date?: string | null
          original_amount: number
          balance_due: number
          status: 'pending' | 'overdue' | 'paid'
          ewity_transaction_id?: string | null
          quickbooks_invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          po_number?: string | null
          customer_id?: string | null
          order_date?: string | null
          due_date?: string | null
          original_amount?: number
          balance_due?: number
          status?: 'pending' | 'overdue' | 'paid'
          ewity_transaction_id?: string | null
          quickbooks_invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      follow_ups: {
        Row: {
          id: string
          receivable_id: string
          scheduled_date: string
          completed: boolean
          completed_date: string | null
          contacted_by: string | null
          method: 'call' | 'email' | 'visit' | null
          notes: string | null
          next_follow_up: string | null
          created_at: string
        }
        Insert: {
          id?: string
          receivable_id: string
          scheduled_date: string
          completed?: boolean
          completed_date?: string | null
          contacted_by?: string | null
          method?: 'call' | 'email' | 'visit' | null
          notes?: string | null
          next_follow_up?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          receivable_id?: string
          scheduled_date?: string
          completed?: boolean
          completed_date?: string | null
          contacted_by?: string | null
          method?: 'call' | 'email' | 'visit' | null
          notes?: string | null
          next_follow_up?: string | null
          created_at?: string
        }
      }
    }
  }
}