"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api, type Report as ApiReport } from "@/utils/api"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToast } from "@/hooks/use-toast"
import { Clock, RefreshCw } from "lucide-react"

export default function AdminOngoingReportsPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth()
  const [reports, setReports] = useState<ApiReport[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getAdminReports({ status: "in-progress" })
      setReports(response.reports || [])
    } catch (error: unknown) {
      console.error("Failed to load reports:", error)
      toast({
        title: "Error Loading Reports",
        description: (error as Error).message || "Unable to load ongoing reports. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadReports()
    }
  }, [isAuthenticated, authLoading, loadReports])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ongoing Reports</h1>
            <p className="text-muted-foreground">Reports currently being addressed</p>
          </div>
          <Button
            onClick={loadReports}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              In Progress Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Ongoing Reports</h3>
                <p className="text-muted-foreground">
                  There are currently no reports in progress.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{report.trackingId}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.replace("-", " ")}
                            </Badge>
                            <Badge className={getSeverityColor(report.priority)}>{report.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
                            {report.location && (
                              <span>📍 Location Available</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}