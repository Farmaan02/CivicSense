"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    status: "all", // Updated default value to 'all'
    priority: "all", // Updated default value to 'all'
    assignedTo: "all", // Updated default value to 'all'
    category: "all", // Updated default value to 'all'
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
  }, [isAuthenticated, authLoading]) // Added authLoading to dependency array

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
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">CivicSense Admin</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Welcome, {admin?.profile?.firstName || admin?.username}</div>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="reports">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.reported}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Urgent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Assigned To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reports ({filteredReports.length})</CardTitle>
                  <Tabs value={view} onValueChange={(value: string) => setView(value as "list" | "map")}>
                    <TabsList>
                      <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        List View
                      </TabsTrigger>
                      <TabsTrigger value="map" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Map View
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {view === "list" ? (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
                    ) : filteredReports.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No reports found</div>
                    ) : (
                      filteredReports.map((report) => (
                        <Card 
                          key={generateReportKey(report)} 
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{report.trackingId}</h3>
                                  <Badge className={statusColors[report.status]}>
                                    {report.status.replace("-", " ")}
                                  </Badge>
                                  <Badge className={priorityColors[report.priority]}>{report.priority}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {report.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(report.createdAt).toLocaleDateString()}
                                  </span>
                                  {report.assignedTo && (
                                    <span className="flex items-center gap-1">
                                      <UserCheck className="h-3 w-3" />
                                      {teams.find((t) => t.id === report.assignedTo)?.name || "Unknown Team"}
                                    </span>
                                  )}
                                  {report.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      Location Available
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>{report.trackingId}</DialogTitle>
                                      <DialogDescription>Report Details</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Description</Label>
                                        <p className="text-sm mt-1">{report.description}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Status</Label>
                                          <Badge className={`${statusColors[report.status]} mt-1`}>
                                            {report.status.replace("-", " ")}
                                          </Badge>
                                        </div>
                                        <div>
                                          <Label>Priority</Label>
                                          <Badge className={`${priorityColors[report.priority]} mt-1`}>
                                            {report.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                      {report.location && (
                                        <div>
                                          <Label>Location</Label>
                                          <p className="text-sm mt-1">
                                            {report.location.address ||
                                              `${report.location.lat}, ${report.location.lng}`}
                                          </p>
                                        </div>
                                      )}
                                      {report.updates.length > 0 && (
                                        <div>
                                          <Label>Updates</Label>
                                          <div className="space-y-2 mt-2">
                                            {report.updates.map((update, index) => (
                                              <div key={index} className="text-sm border-l-2 border-muted pl-3">
                                                <p>{update.message}</p>
                                                <p className="text-xs text-muted-foreground">
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
                  <div className="h-96">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Report</DialogTitle>
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
                        {team.name} ({team.availableCapacity} available)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
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