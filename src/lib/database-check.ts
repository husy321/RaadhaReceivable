'use client'

import { supabase } from './supabase-client'

// Test database connection and table existence
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  tablesExist: boolean
  error?: string
}> {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('customers')
      .select('count(*)')
      .limit(1)

    if (connectionError) {
      return {
        connected: false,
        tablesExist: false,
        error: connectionError.message
      }
    }

    return {
      connected: true,
      tablesExist: true
    }
  } catch (error) {
    return {
      connected: false,
      tablesExist: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Check if we should use fallback data
export async function shouldUseFallbackData(): Promise<boolean> {
  const check = await checkDatabaseConnection()
  return !check.connected || !check.tablesExist
}