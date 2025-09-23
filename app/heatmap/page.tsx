"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapView } from "@/components/map/map-view"
import { apiClient, type Report } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

export default function HeatmapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getReports()
      setReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
      toast({
        title: "Error Loading Reports",
        description: "Unable to load reports for the heatmap. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter reports to only include those with location data
  const reportsWithLocation = reports.filter(report => report.location)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:pl-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issue Heatmap</h1>
              <p className="text-gray-600 mt-1">Visualize reported issues by location and frequency</p>
            </div>
            <Button
              onClick={loadReports}
              variant="outline"
              disabled={loading}
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {/* Heatmap Container */}
      <div className="max-w-7xl mx-auto p-4 md:pl-4">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Community Issues Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-civic-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading heatmap data...</p>
                </div>
              </div>
            ) : reportsWithLocation.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    There are currently no reports with location data to display on the heatmap. 
                    Reports will appear here once community members submit issues with location information.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapView reports={reportsWithLocation} className="h-full" />
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">About the Heatmap</h3>
              <p className="text-gray-600 text-sm">
                This heatmap visualizes the concentration of reported community issues. 
                Areas with higher concentrations of reports are shown in warmer colors (reds and oranges), 
                while areas with fewer reports are shown in cooler colors (blues and greens). 
                This visualization helps identify areas that may require more attention from municipal services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}