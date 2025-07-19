'use client'

import { supabase } from './supabase-client'
import type { Database } from './supabase-types'

// Type aliases for easier use
type Customer = Database['public']['Tables']['customers']['Row']
type Receivable = Database['public']['Tables']['receivables']['Row']
type FollowUp = Database['public']['Tables']['follow_ups']['Row']

export type ReceivableWithCustomer = Receivable & {
  customer: Customer
  aging_days: number
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data || []
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return data
}

// Receivables
export async function getReceivables(): Promise<ReceivableWithCustomer[]> {
  const { data, error } = await supabase
    .from('receivables')
    .select(`
      *,
      customer:customers(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching receivables:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  // Calculate aging days and add to each receivable
  return (data || []).map(receivable => ({
    ...receivable,
    customer: receivable.customer as Customer,
    aging_days: calculateAgingDays(receivable.due_date)
  }))
}

export async function getReceivableById(id: string): Promise<ReceivableWithCustomer | null> {
  const { data, error } = await supabase
    .from('receivables')
    .select(`
      *,
      customer:customers(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching receivable:', error)
    return null
  }

  return {
    ...data,
    customer: data.customer as Customer,
    aging_days: calculateAgingDays(data.due_date)
  }
}

export async function getReceivablesByStatus(status: 'pending' | 'overdue' | 'paid'): Promise<ReceivableWithCustomer[]> {
  const { data, error } = await supabase
    .from('receivables')
    .select(`
      *,
      customer:customers(*)
    `)
    .eq('status', status)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching receivables by status:', error)
    return []
  }

  return (data || []).map(receivable => ({
    ...receivable,
    customer: receivable.customer as Customer,
    aging_days: calculateAgingDays(receivable.due_date)
  }))
}

// Follow-ups
export async function getFollowUps(): Promise<FollowUp[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .order('scheduled_date', { ascending: true })

  if (error) {
    console.error('Error fetching follow-ups:', error)
    return []
  }

  return data || []
}

export async function getTodaysFollowUps(): Promise<FollowUp[]> {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('scheduled_date', today)
    .eq('completed', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching today\'s follow-ups:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  return data || []
}

// Dashboard statistics
export async function getDashboardStats() {
  try {
    // Get all receivables
    const receivables = await getReceivables()
    
    // Calculate statistics
    const totalOutstanding = receivables.reduce((sum, r) => sum + r.balance_due, 0)
    const overdueCount = receivables.filter(r => r.status === 'overdue').length
    
    // Get today's follow-ups
    const upcomingFollowUps = await getTodaysFollowUps()
    
    // Calculate aging buckets
    const agingBuckets = {
      '0-30': receivables.filter(r => r.aging_days >= 0 && r.aging_days <= 30).reduce((sum, r) => sum + r.balance_due, 0),
      '31-60': receivables.filter(r => r.aging_days >= 31 && r.aging_days <= 60).reduce((sum, r) => sum + r.balance_due, 0),
      '61-90': receivables.filter(r => r.aging_days >= 61 && r.aging_days <= 90).reduce((sum, r) => sum + r.balance_due, 0),
      '90+': receivables.filter(r => r.aging_days > 90).reduce((sum, r) => sum + r.balance_due, 0)
    }

    // Mock collection rate for now (could be calculated from payment history)
    const collectionRate = 0.85

    return {
      totalOutstanding,
      overdueCount,
      collectionRate,
      upcomingFollowUps: upcomingFollowUps.length,
      agingBuckets
    }
  } catch (error) {
    console.error('Error calculating dashboard stats:', error)
    return {
      totalOutstanding: 0,
      overdueCount: 0,
      collectionRate: 0,
      upcomingFollowUps: 0,
      agingBuckets: {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0
      }
    }
  }
}

// Utility functions
function calculateAgingDays(dueDate: string | null): number {
  if (!dueDate) return 0
  
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

// Insert functions for creating new records
export async function createCustomer(customer: Database['public']['Tables']['customers']['Insert']): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    return null
  }

  return data
}

export async function createReceivable(receivable: Database['public']['Tables']['receivables']['Insert']): Promise<Receivable | null> {
  const { data, error } = await supabase
    .from('receivables')
    .insert(receivable)
    .select()
    .single()

  if (error) {
    console.error('Error creating receivable:', error)
    return null
  }

  return data
}

export async function createFollowUp(followUp: Database['public']['Tables']['follow_ups']['Insert']): Promise<FollowUp | null> {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(followUp)
    .select()
    .single()

  if (error) {
    console.error('Error creating follow-up:', error)
    return null
  }

  return data
}