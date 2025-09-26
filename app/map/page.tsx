"use client"
import { useState, useEffect, useCallback } from "react"
import { MapView } from "@/components/map/map-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiClient, type Report } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const { toast } = useToast()

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.getReports()
      setReports(data)
    } catch (error) {
      console.error("[v0] Error loading reports:", error)
      toast({
        title: "Error Loading Reports",
        description: "Unable to load reports for the map. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleMarkerClick = (report: Report) => {
    setSelectedReport(report)
  }

  const handleViewDetail = (reportId: string) => {
    // Navigate to report detail page (placeholder)
    console.log("[v0] Navigate to report detail:", reportId)
    toast({
      title: "Report Details",
      description: "Report detail page coming soon!",
      duration: 3000,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-civic-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Loading Map</h2>
              <p className="text-gray-600">Fetching community reports...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Filter reports to only include those with location data
  const reportsWithLocation = reports.filter(report => report.location)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 md:pl-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Issues Map</h1>
              <p className="text-gray-600">View reported issues in your area</p>
            </div>
            <Button
              onClick={loadReports}
              variant="outline"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto p-4 md:pl-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <MapView reports={reportsWithLocation} onMarkerClick={handleMarkerClick} className="h-[600px]" />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Report Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reports</span>
                  <span className="font-medium">{reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reports with Location</span>
                  <span className="font-medium">{reportsWithLocation.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Priority</span>
                  <span className="font-medium text-red-600">
                    {reports.filter((r) => r.severity === "high").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medium Priority</span>
                  <span className="font-medium text-orange-600">
                    {reports.filter((r) => r.severity === "medium").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Priority</span>
                  <span className="font-medium text-green-600">
                    {reports.filter((r) => r.severity === "low").length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Selected Report */}
            {selectedReport && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Selected Report</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-civic-primary">{selectedReport.title || "Civic Issue Report"}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedReport.description}</p>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Status: <span className="font-medium">{selectedReport.status}</span>
                    </div>
                    <div>
                      Priority: <span className="font-medium">{selectedReport.severity}</span>
                    </div>
                    <div>Reported: {new Date(selectedReport.createdAt).toLocaleDateString()}</div>
                    {selectedReport.location?.address && <div>Location: {selectedReport.location.address}</div>}
                  </div>

                  <Button
                    onClick={() => handleViewDetail(selectedReport._id)}
                    className="w-full bg-civic-primary hover:bg-civic-accent text-white"
                    size="sm"
                  >
                    View Full Details
                  </Button>
                </div>
              </Card>
            )}

            {/* Recent Reports List */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Reports</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reports.slice(0, 5).map((report) => (
                  <div
                    key={report._id}
                    className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{report.title || "Civic Issue"}</p>
                        <p className="text-xs text-gray-600 mt-1">{report.description.substring(0, 60)}...</p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ml-2 mt-1 ${
                          report.severity === "high"
                            ? "bg-red-500"
                            : report.severity === "medium"
                              ? "bg-orange-500"
                              : "bg-green-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}