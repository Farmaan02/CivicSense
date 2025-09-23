"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { apiClient, type Report } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getReports({ format: "list" })
      setReports(data)
    } catch (error) {
      console.error("[v0] Error loading reports:", error)
      toast({
        title: "Error Loading Reports",
        description: error instanceof Error ? error.message : "Unable to load reports. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.trackingId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesSeverity = severityFilter === "all" || report.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
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
              <h2 className="text-xl font-semibold text-gray-800">Loading Reports</h2>
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
              <h1 className="text-3xl font-bold text-gray-900">Community Reports</h1>
              <p className="text-gray-600 mt-1">Browse and track reported issues in your community</p>
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:pl-4">
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {filteredReports.length} of {reports.length} reports
              </span>
            </div>
          </div>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-500">#{report.trackingId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm line-clamp-3">{report.description}</p>

                {/* Media Preview */}
                {report.mediaUrl && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={report.mediaUrl || "/placeholder.svg"}
                      alt="Report media"
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

        {/* Empty State */}
        {filteredReports.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">No Reports Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || severityFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "No reports have been submitted yet."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}