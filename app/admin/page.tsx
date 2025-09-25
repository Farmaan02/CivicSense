"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, List, Filter, Search, UserCheck, Users, FileText, Calendar, Eye, Edit, BarChart3 } from "lucide-react"
import { ReportsMap } from "@/components/admin/reports-map"
import { TeamTable } from "@/components/admin/team-table"
import { AnalyticsPanel } from "@/components/admin/analytics-panel"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { api, type Report as ApiReport } from "@/utils/api"
import { clearAuthState, forceLogout } from "@/utils/auth-utils"

// Use the API Report type with admin-specific extensions
type AdminReport = ApiReport & {
  assignedTo: string | null
  updates: Array<{
    type: string
    message: string
    createdBy: string
    createdAt: string
  }>
}

interface Team {
  id: string
  name: string
  department: string
  currentLoad: number
  capacity: number
  availableCapacity: number
  canTakeAssignment: boolean
}

const statusColors: Record<string, string> = {
  reported: "bg-blue-100 text-blue-800",
  "in-review": "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export default function AdminDashboard() {
  const { admin, isAuthenticated, logout, loading: authLoading, error: authError } = useAdminAuth()
  const [reports, setReports] = useState<AdminReport[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "map">("list")
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [assignmentData, setAssignmentData] = useState({ teamId: "", note: "" })
  const [statusData, setStatusData] = useState({ status: "", note: "" })
  const [activeTab, setActiveTab] = useState("reports")
  const [authErrorDisplayed, setAuthErrorDisplayed] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    assignedTo: "all",
    category: "all",
  })

  // Load data
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Add error boundary for async operations
      const loadData = async () => {
        try {
          await Promise.all([loadReports(), loadTeams()])
        } catch (error) {
          console.error('Failed to load admin data:', error)
        }
      }
      loadData()
    }
  }, [isAuthenticated, authLoading])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await api.getAdminReports()
      setReports((response.reports as any) || [])
    } catch (error: any) {
      console.error("Failed to load reports:", error)
      // Handle auth errors by clearing expired token and forcing re-login
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        console.log('Authentication failed, clearing token...')
        logout()
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const loadTeams = async () => {
    try {
      const teamsData = await api.getTeams()
      setTeams(teamsData)
    } catch (error: any) {
      console.error("Failed to load teams:", error)
      // Handle auth errors by clearing expired token and forcing re-login
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        console.log('Teams authentication failed, clearing token...')
        logout()
        return
      }
    }
  }

  const handleAssignReport = async () => {
    if (!selectedReport || !assignmentData.teamId) return

    try {
      await api.assignReport(selectedReport.id, assignmentData.teamId)
      await loadReports()
      await loadTeams()
      setIsAssignDialogOpen(false)
      setAssignmentData({ teamId: "", note: "" })
      setSelectedReport(null)
    } catch (error) {
      console.error("Failed to assign report:", error)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedReport || !statusData.status) return

    try {
      await api.updateReportStatus(selectedReport.id, statusData.status, statusData.note)
      await loadReports()
      setIsStatusDialogOpen(false)
      setStatusData({ status: "", note: "" })
      setSelectedReport(null)
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (
      filters.search &&
      !report.description.toLowerCase().includes(filters.search.toLowerCase()) &&
      !report.trackingId.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }
    if (filters.status !== "all" && report.status !== filters.status) return false
    if (filters.priority !== "all" && report.priority !== filters.priority) return false
    if (filters.assignedTo !== "all" && report.assignedTo !== filters.assignedTo) return false
    if (filters.category !== "all" && report.category !== filters.category) return false
    return true
  })

  const stats = {
    total: reports.length,
    reported: reports.filter((r) => r.status === "reported").length,
    inProgress: reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    urgent: reports.filter((r) => r.priority === "urgent").length,
  }

  // Handle authentication error display
  useEffect(() => {
    if (authError && !authErrorDisplayed) {
      setAuthErrorDisplayed(true)
      console.error('Authentication error:', authError)
    }
  }, [authError, authErrorDisplayed])

  // Don't render anything if still loading authentication
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

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:pl-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome, {admin?.profile?.firstName || admin?.username}</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="reports">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <Card className="civic-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 group rounded-lg overflow-hidden hover:border-l-blue-600 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 transform group-hover:scale-105 transition-transform duration-300">{stats.total}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-foreground">Total Reports</h3>
                    <p className="text-xs text-muted-foreground mt-1">Community issues reported</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="civic-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 group rounded-lg overflow-hidden hover:border-l-green-600 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                      <span className="text-base">🆕</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 transform group-hover:scale-105 transition-transform duration-300">{stats.reported}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-foreground">New Reports</h3>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting initial review</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="civic-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 group rounded-lg overflow-hidden hover:border-l-orange-600 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                      <span className="text-base">🔄</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600 transform group-hover:scale-105 transition-transform duration-300">{stats.inProgress}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-foreground">In Progress</h3>
                    <p className="text-xs text-muted-foreground mt-1">Currently being addressed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="civic-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 group rounded-lg overflow-hidden hover:border-l-purple-600 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                      <span className="text-base">✅</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 transform group-hover:scale-105 transition-transform duration-300">{stats.resolved}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-foreground">Resolved</h3>
                    <p className="text-xs text-muted-foreground mt-1">Successfully addressed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="civic-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500 group rounded-lg overflow-hidden hover:border-l-red-600 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                      <span className="text-base">🚨</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600 transform group-hover:scale-105 transition-transform duration-300">{stats.urgent}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-foreground">Urgent</h3>
                    <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="civic-card mb-8">
              <CardHeader className="bg-muted/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      className="pl-10 py-5 rounded-xl civic-input"
                    />
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="rounded-xl py-5 civic-input">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="rounded-xl py-5 civic-input">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.assignedTo}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger className="rounded-xl py-5 civic-input">
                      <SelectValue placeholder="Assigned To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          <span className="truncate max-w-[150px]">{team.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="rounded-xl py-5 hover:bg-muted transition-colors civic-transition"
                    onClick={() =>
                      setFilters({ search: "", status: "all", priority: "all", assignedTo: "all", category: "all" })
                    }
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* View Toggle and Reports */}
            <Card className="civic-card">
              <CardHeader className="bg-muted/50 rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg">Reports ({filteredReports.length})</CardTitle>
                  <Tabs value={view} onValueChange={(value: string) => setView(value as "list" | "map")}>
                    <TabsList className="rounded-xl p-1 bg-muted">
                      <TabsTrigger value="list" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                        <List className="h-4 w-4" />
                        List View
                      </TabsTrigger>
                      <TabsTrigger value="map" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                        <MapPin className="h-4 w-4" />
                        Map View
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {view === "list" ? (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        Loading reports...
                      </div>
                    ) : filteredReports.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No reports found</p>
                        <p className="text-sm mt-2">Try adjusting your filters to see more results</p>
                      </div>
                    ) : (
                      filteredReports.map((report) => (
                        <Card 
                          key={generateReportKey(report)} 
                          className="civic-card transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600 group"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent flexbox overflow */}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <h3 className="font-bold text-lg truncate">{report.trackingId}</h3>
                                  <Badge className={`${statusColors[report.status]} font-medium px-3 py-1 rounded-full`}>
                                    {report.status.replace("-", " ")}
                                  </Badge>
                                  <Badge className={`${priorityColors[report.priority]} font-medium px-3 py-1 rounded-full`}>
                                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mb-4 line-clamp-2 break-words">
                                  {report.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1 flex-shrink-0">
                                    <Calendar className="h-4 w-4" />
                                    <span className="whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</span>
                                  </span>
                                  {report.assignedTo && (
                                    <span className="flex items-center gap-1 flex-shrink-0">
                                      <UserCheck className="h-4 w-4" />
                                      <span className="truncate max-w-[150px]">{teams.find((t) => t.id === report.assignedTo)?.name || "Unknown Team"}</span>
                                    </span>
                                  )}
                                  {report.location && (
                                    <span className="flex items-center gap-1 flex-shrink-0">
                                      <MapPin className="h-4 w-4" />
                                      <span className="truncate max-w-[150px]">Location Available</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-lg hover:bg-muted civic-transition">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl rounded-xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-xl break-words">{report.trackingId}</DialogTitle>
                                      <DialogDescription>Report Details</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                      <div>
                                        <Label className="text-base">Description</Label>
                                        <p className="text-muted-foreground mt-2 break-words">{report.description}</p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-base">Status</Label>
                                          <Badge className={`${statusColors[report.status]} mt-2 text-sm font-medium px-3 py-1 rounded-full`}>
                                            {report.status.replace("-", " ")}
                                          </Badge>
                                        </div>
                                        <div>
                                          <Label className="text-base">Priority</Label>
                                          <Badge className={`${priorityColors[report.priority]} mt-2 text-sm font-medium px-3 py-1 rounded-full`}>
                                            {report.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                      {report.location && (
                                        <div>
                                          <Label className="text-base">Location</Label>
                                          <p className="text-muted-foreground mt-2 break-words">
                                            {report.location.address ||
                                              `${report.location.lat}, ${report.location.lng}`}
                                          </p>
                                        </div>
                                      )}
                                      {report.updates.length > 0 && (
                                        <div>
                                          <Label className="text-base">Updates</Label>
                                          <div className="space-y-3 mt-2">
                                            {report.updates.map((update, index) => (
                                              <div key={index} className="text-sm border-l-4 border-muted pl-4 py-2 bg-muted/50 rounded-r-lg">
                                                <p className="font-medium break-words">{update.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {update.createdBy} • {new Date(update.createdAt).toLocaleString()}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg hover:bg-muted civic-transition"
                                  onClick={() => {
                                    setSelectedReport(report)
                                    setIsAssignDialogOpen(true)
                                  }}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg hover:bg-muted civic-transition"
                                  onClick={() => {
                                    setSelectedReport(report)
                                    setStatusData({ status: report.status, note: "" })
                                    setIsStatusDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="h-[500px] rounded-xl overflow-hidden border shadow-sm">
                    <ReportsMap reports={filteredReports.filter((r) => r.location) as any[]} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <TeamTable teams={teams} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Assign Report</DialogTitle>
            <DialogDescription>Assign {selectedReport?.trackingId} to a team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team">Select Team</Label>
              <Select
                value={assignmentData.teamId}
                onValueChange={(value) => setAssignmentData((prev) => ({ ...prev, teamId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((team) => team.canTakeAssignment)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="break-words max-w-[250px] truncate">{team.name} ({team.availableCapacity} available)</div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="note">Assignment Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any notes about this assignment..."
                value={assignmentData.note}
                onChange={(e) => setAssignmentData((prev) => ({ ...prev, note: e.target.value }))}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignReport} disabled={!assignmentData.teamId}>
                Assign Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Update Status</DialogTitle>
            <DialogDescription>Update the status of {selectedReport?.trackingId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select
                value={statusData.status}
                onValueChange={(value) => setStatusData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusNote">Status Note (Optional)</Label>
              <Textarea
                id="statusNote"
                placeholder="Add any notes about this status change..."
                value={statusData.note}
                onChange={(e) => setStatusData((prev) => ({ ...prev, note: e.target.value }))}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={!statusData.status}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Enhanced key generation function for React lists
const generateReportKey = (report: AdminReport): string => {
  // Priority order for key generation
  if (report._id) return `report-${report._id}`
  if (report.id) return `report-${report.id}`
  if (report.trackingId) return `report-${report.trackingId}`
  
  // Fallback to combination of properties
  return `report-${report.createdAt}-${report.description.substring(0, 20)}`
}