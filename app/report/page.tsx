"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ReportForm } from "@/components/report-modal/report-form"
import { MapView } from "@/components/map/map-view"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type Report } from "@/utils/api"
import { Plus, Search, MapPin, List, Filter, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { useEffect } from "react"

export default function ReportPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [statusFilter, severityFilter])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const options: any = {}
      if (statusFilter !== "all") options.status = statusFilter
      if (severityFilter !== "all") options.severity = severityFilter

      const data = await apiClient.getReports(options)
      setReports(data)
    } catch (error) {
      console.error("Failed to load reports:", error)
      toast({
        title: "Error Loading Reports",
        description: "Unable to fetch reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportSubmitted = () => {
    setIsReportModalOpen(false)
    loadReports() // Refresh the reports list
    toast({
      title: "Report Submitted!",
      description: "Thank you for helping improve our community.",
    })
  }

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in-progress":
      case "ongoing":
        return <AlertTriangle className="h-4 w-4" />
      case "completed":
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-civic-text mb-4 text-balance">Community Issue Reporting</h1>
          <p className="text-lg text-civic-text/80 max-w-2xl text-pretty">
            Help us improve our community by reporting issues, concerns, or suggestions. Your voice matters in making
            our city better for everyone.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-civic-primary hover:bg-civic-accent text-white font-medium px-6 py-3 h-auto">
                <Plus className="h-5 w-5 mr-2" />
                Report an Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-civic-text">Report a Community Issue</DialogTitle>
                <DialogDescription className="text-civic-text/70">
                  Provide details about the issue you'd like to report. Include photos and location for faster
                  resolution.
                </DialogDescription>
              </DialogHeader>
              <ReportForm onClose={handleReportSubmitted} />
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Map
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Priority</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={loadReports} disabled={isLoading} className="w-full bg-transparent">
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === "map" ? (
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapView reports={filteredReports} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-primary mx-auto mb-4"></div>
                <p className="text-civic-text/60">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                      ? "Try adjusting your filters or search terms."
                      : "Be the first to report an issue in your community."}
                  </p>
                  <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-civic-primary hover:bg-civic-accent text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Report an Issue
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-civic-text mb-2">{report.title}</h3>
                        <p className="text-civic-text/70 mb-3 line-clamp-2">{report.description}</p>
                      </div>
                      {report.mediaUrl && (
                        <div className="ml-4 flex-shrink-0">
                          <img
                            src={report.mediaUrl || "/placeholder.svg"}
                            alt="Report media"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${getStatusColor(report.status)} border`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status}</span>
                      </Badge>
                      <Badge className={`${getSeverityColor(report.severity)} border`}>
                        <span className="capitalize">{report.severity} Priority</span>
                      </Badge>
                      <Badge variant="outline" className="text-civic-text/60">
                        {report.category}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-sm text-civic-text/60">
                      <div className="flex items-center gap-4">
                        <span>ID: {report.trackingId}</span>
                        {report.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location provided
                          </span>
                        )}
                      </div>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
