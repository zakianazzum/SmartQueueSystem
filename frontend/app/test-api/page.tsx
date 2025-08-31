"use client"
import { useState, useEffect } from "react"
import { institutionApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestApiPage() {
  const [institutions, setInstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApiConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await institutionApi.getAll()
      setInstitutions(data)
      console.log("API Response:", data)
    } catch (err) {
      console.error("API Error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApiConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Connection Test</h1>
        <p className="text-muted-foreground">Testing connection to the Smart Queue System backend API</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="font-medium">
                {error ? 'Connection Failed' : loading ? 'Connecting...' : 'Connected Successfully'}
              </span>
            </div>
            
            <Button onClick={testApiConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {institutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Institutions from API ({institutions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutions.map((institution) => (
                <div key={institution.institutionId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{institution.name}</h3>
                    <Badge variant="outline">
                      {institution.institutionType?.institutionType || "Unknown Type"}
                    </Badge>
                  </div>
                  {institution.institutionDescription && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {institution.institutionDescription}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Branches:</span> {institution.branches.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Total Crowd:</span> {
                      institution.branches.reduce((sum: number, branch: any) => 
                        sum + (branch.totalCrowdCount || 0), 0
                      )
                    } people
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Base URL:</strong> http://localhost:8000/api/v1</div>
            <div><strong>Institutions:</strong> GET /institutions</div>
            <div><strong>Institution Types:</strong> GET /institution-types</div>
            <div><strong>Branches:</strong> GET /branches</div>
            <div><strong>Users:</strong> GET /users</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
