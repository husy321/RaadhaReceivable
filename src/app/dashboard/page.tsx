"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDashboardStats, getTodaysFollowUps, getReceivables } from "@/lib/data-services"
import { checkDatabaseConnection } from "@/lib/database-check"
import { getDashboardStats as getMockStats, mockReceivables, mockFollowUps } from "@/lib/mock-data"
import type { ReceivableWithCustomer } from "@/lib/data-services"
import type { Database } from "@/lib/supabase-types"
import { 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Phone,
  Mail,
  FileText,
  Plus,
  Database as DatabaseIcon,
  ExternalLink
} from "lucide-react"

type FollowUp = Database['public']['Tables']['follow_ups']['Row']

export default function DashboardPage() {
  const [stats, setStats] = useState({
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
  })
  const [todaysFollowUps, setTodaysFollowUps] = useState<any[]>([])
  const [receivables, setReceivables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Check database connection first
        const dbCheck = await checkDatabaseConnection()
        
        if (!dbCheck.connected || !dbCheck.tablesExist) {
          console.warn('Database not connected, using fallback data:', dbCheck.error)
          setUsingFallbackData(true)
          setDatabaseError(dbCheck.error || 'Database tables not found')
          
          // Use mock data as fallback
          const mockStats = getMockStats()
          const mockTodaysFollowUps = mockFollowUps.filter(f => {
            const today = new Date().toISOString().split('T')[0]
            return f.scheduled_date === today && !f.completed
          })
          
          setStats(mockStats)
          setTodaysFollowUps(mockTodaysFollowUps)
          setReceivables(mockReceivables)
        } else {
          // Use real Supabase data
          const [dashboardStats, followUps, receivablesData] = await Promise.all([
            getDashboardStats(),
            getTodaysFollowUps(),
            getReceivables()
          ])
          
          setStats(dashboardStats)
          setTodaysFollowUps(followUps)
          setReceivables(receivablesData)
          setUsingFallbackData(false)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setDatabaseError(error instanceof Error ? error.message : 'Unknown error')
        setUsingFallbackData(true)
        
        // Fallback to mock data
        const mockStats = getMockStats()
        setStats(mockStats)
        setTodaysFollowUps([])
        setReceivables(mockReceivables)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  const recentActivities = [
    { id: 1, type: 'payment', description: 'Payment received from ABC Manufacturing', amount: 5000, time: '2 hours ago' },
    { id: 2, type: 'overdue', description: 'Invoice RCP-2024-003 became overdue', amount: 22000, time: '1 day ago' },
    { id: 3, type: 'followup', description: 'Follow-up scheduled with TechCorp Solutions', time: '2 days ago' },
    { id: 4, type: 'invoice', description: 'New invoice RCP-2024-005 created', amount: 35000, time: '3 days ago' }
  ]

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {usingFallbackData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Database Setup Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              {databaseError ? `Database Error: ${databaseError}` : 'Supabase database tables not found.'}
              <br />
              Currently showing demo data. To use real data, please run the database schema in your Supabase project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your receivables and collections
            {usingFallbackData && <span className="text-orange-600"> (Demo Data)</span>}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Receivable
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.collectionRate)}</div>
            <p className="text-xs text-muted-foreground">
              This month's performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingFollowUps}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Aging Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receivables Aging</CardTitle>
            <CardDescription>Outstanding amounts by aging periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.agingBuckets).map(([period, amount]) => (
                <div key={period} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded" />
                    <span className="text-sm font-medium">{period} days</span>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Follow-ups</CardTitle>
            <CardDescription>Scheduled customer contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysFollowUps.length > 0 ? (
                todaysFollowUps.map((followUp) => {
                  const receivable = receivables.find(r => r.id === followUp.receivable_id)
                  return (
                    <div key={followUp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {followUp.method === 'call' ? (
                          <Phone className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Mail className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{receivable?.customer.name || 'Unknown Customer'}</p>
                          <p className="text-xs text-muted-foreground">{followUp.notes}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No follow-ups scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                {activity.amount && (
                  <div className="flex-shrink-0 text-sm font-medium">
                    {formatCurrency(activity.amount)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              Add Receivable
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Phone className="h-6 w-6 mb-2" />
              Schedule Follow-up
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Record Payment
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}