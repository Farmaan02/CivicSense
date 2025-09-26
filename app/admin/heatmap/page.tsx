"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { ReportsMap } from "../../../components/admin/reports-map"
import { api, type Report as ApiReport } from "../../../utils/api"
import { useAdminAuth } from "../../../hooks/use-admin-auth"
import { useToast } from "../../../hooks/use-toast"
import { RefreshCw, AlertTriangle } from "lucide-react"

export default function AdminHeatmapPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth()
  const [reports, setReports] = useState<ApiReport[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getAdminReports()
      setReports(response.reports || [])
    } catch (error: unknown) {
      console.error("Failed to load reports:", error)
      toast({
        title: "Error Loading Reports",
        description: (error as Error).message || "Unable to load reports for the heatmap. Please try again.",
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

  // Filter reports to only include those with location data
  const reportsWithLocation = reports.filter((report: ApiReport) => report.location)

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
            <h1 className="text-2xl font-bold text-foreground">Reports Heatmap</h1>
            <p className="text-muted-foreground">Visualize reported issues by location and frequency</p>
          </div>
          <Button
            onClick={loadReports}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* Heatmap Container */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Issue Concentration Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading heatmap data...</p>
                </div>
              </div>
            ) : reportsWithLocation.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    There are currently no reports with location data to display on the heatmap. 
                    Reports will appear here once community members submit issues with location information.
                  </p>
                  <Button onClick={loadReports} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[600px]">
                <ReportsMap reports={reportsWithLocation
                  .filter((r): r is ApiReport & { location: NonNullable<ApiReport['location']> } => r.location !== undefined)
                  .map(report => ({
                    ...report,
                    status: report.status as "reported" | "in-review" | "in-progress" | "resolved" | "closed",
                    priority: report.priority as "low" | "medium" | "high" | "urgent"
                  }))} />
              </div>
            )}
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">About the Heatmap</h3>
              <p className="text-muted-foreground text-sm">
                This heatmap visualizes the concentration of reported community issues. 
                Areas with higher concentrations of reports are shown in warmer colors, 
                while areas with fewer reports are shown in cooler colors. 
                This visualization helps identify areas that may require more attention from municipal services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}