"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient, type Report } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { Clock, RefreshCw } from "lucide-react"
import Image from "next/image"

export default function OngoingReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.getReports({ status: "in-progress" })
      setReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
      toast({
        title: "Error Loading Reports",
        description: error instanceof Error ? error.message : "Unable to load ongoing reports. Please try again.",
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-civic-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Loading Ongoing Reports</h2>
              <p className="text-gray-600">Fetching community reports...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:pl-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ongoing Reports</h1>
              <p className="text-gray-600 mt-1">Reports that are currently being addressed</p>
            </div>
            <Button
              onClick={loadReports}
              variant="outline"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:pl-4">
        {reports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">No Ongoing Reports</h3>
                <p className="text-gray-600">
                  There are currently no reports in progress. Check back later or view all reports.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-500">#{report.trackingId}</p>
                    </div>
                    <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm line-clamp-3">{report.description}</p>

                  {/* Media Preview */}
                  {report.mediaUrl && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={report.mediaUrl || "/placeholder.svg"}
                        alt="Report media"
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  {/* Location */}
                  {report.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📍</span>
                      <span>
                        {report.location.address ||
                          `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>👁️ {report.viewCount}</span>
                      <span>👍 {report.upvotes}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}