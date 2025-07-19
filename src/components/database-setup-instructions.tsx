"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"

export function DatabaseSetupInstructions() {
  const [copied, setCopied] = useState(false)

  const sqlSchema = `-- Run this in your Supabase SQL editor
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (run the complete schema from database/schema.sql)
-- Or copy from: database/schema.sql in your project`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">🚀 Setup Instructions</CardTitle>
        <CardDescription className="text-blue-700">
          Follow these steps to connect your Supabase database:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-blue-800">Open Supabase Dashboard</p>
              <p className="text-sm text-blue-700">Go to your Supabase project dashboard</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-blue-800">Navigate to SQL Editor</p>
              <p className="text-sm text-blue-700">Click on "SQL Editor" in the left sidebar</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-blue-800">Run Database Schema</p>
              <p className="text-sm text-blue-700">Copy and paste the complete schema from <code className="bg-blue-100 px-1 rounded">database/schema.sql</code></p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <p className="font-medium text-blue-800">Refresh Application</p>
              <p className="text-sm text-blue-700">Come back here and refresh the page</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Quick Copy Schema:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
            {sqlSchema}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button size="sm" asChild>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}