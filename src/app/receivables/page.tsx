"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockReceivables } from "@/lib/mock-data"
import { 
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  FileText,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"

export default function ReceivablesPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAgingColor = (days: number) => {
    if (days === 0) return 'text-green-600'
    if (days <= 30) return 'text-yellow-600'
    if (days <= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receivables</h1>
          <p className="text-muted-foreground">Manage and track outstanding payments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Receivable
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Receivables List</CardTitle>
              <CardDescription>All outstanding and paid invoices</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Receipt #</th>
                  <th className="text-left p-4 font-medium">PO Number</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Balance Due</th>
                  <th className="text-left p-4 font-medium">Aging</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockReceivables.map((receivable) => (
                  <tr key={receivable.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Link 
                        href={`/receivables/${receivable.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {receivable.receipt_number}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {receivable.po_number || '-'}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{receivable.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {receivable.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {formatCurrency(receivable.balance_due)}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getAgingColor(receivable.aging_days)}`}>
                        {receivable.aging_days === 0 ? 'Current' : `${receivable.aging_days} days`}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receivable.status)}`}>
                        {receivable.status.charAt(0).toUpperCase() + receivable.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(receivable.due_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockReceivables.reduce((sum, r) => sum + r.balance_due, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                mockReceivables
                  .filter(r => r.status === 'overdue')
                  .reduce((sum, r) => sum + r.balance_due, 0)
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Days Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                mockReceivables.reduce((sum, r) => sum + r.aging_days, 0) / mockReceivables.length
              )} days
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}