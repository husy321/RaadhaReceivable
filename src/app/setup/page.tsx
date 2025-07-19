"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatabaseSetupInstructions } from "@/components/database-setup-instructions"
import { checkDatabaseConnection } from "@/lib/database-check"
import { CheckCircle, AlertCircle, Database, RefreshCw } from "lucide-react"

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean
    tablesExist: boolean
    error?: string
  } | null>(null)
  const [checking, setChecking] = useState(false)

  const checkConnection = async () => {
    setChecking(true)
    try {
      const status = await checkDatabaseConnection()
      setDbStatus(status)
    } catch (error) {
      setDbStatus({
        connected: false,
        tablesExist: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Setup</h1>
        <p className="text-muted-foreground">Configure your Supabase database connection</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Connection Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checking ? (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking connection...</span>
              </div>
            ) : dbStatus ? (
              <>
                <div className="flex items-center gap-2">
                  {dbStatus.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={dbStatus.connected ? "text-green-700" : "text-red-700"}>
                    Database Connection: {dbStatus.connected ? "Connected" : "Failed"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {dbStatus.tablesExist ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                  <span className={dbStatus.tablesExist ? "text-green-700" : "text-orange-700"}>
                    Database Tables: {dbStatus.tablesExist ? "Found" : "Not Found"}
                  </span>
                </div>

                {dbStatus.error && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {dbStatus.error}
                    </p>
                  </div>
                )}

                {dbStatus.connected && dbStatus.tablesExist && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-700">
                      ✅ <strong>Setup Complete!</strong> Your database is ready to use.
                    </p>
                    <div className="mt-2">
                      <Button size="sm" asChild>
                        <a href="/dashboard">Go to Dashboard</a>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={checkConnection} disabled={checking}>
                <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                Check Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions - Show only if not fully set up */}
      {dbStatus && (!dbStatus.connected || !dbStatus.tablesExist) && (
        <DatabaseSetupInstructions />
      )}

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Current configuration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
              <span className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              <span className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}