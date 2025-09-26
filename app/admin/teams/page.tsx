"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// ... existing code ...
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TeamTable } from "@/components/admin/team-table"
// ... existing code ...
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, Users, RefreshCw } from "lucide-react"

interface Team {
  id: string
  name: string
  description?: string
  department: string
  currentLoad: number
  capacity: number
  availableCapacity: number
  canTakeAssignment: boolean
  members?: Array<{
    name: string
    email: string
    role: string
  }>
  assignedReports?: Array<{
    reportId: string
    assignedAt: string
    priority: string
  }>
}

const mockTeams: Team[] = [
  {
    id: "1",
    name: "Road Maintenance Team",
    description: "Responsible for road repairs, pothole filling, and street maintenance",
    department: "Public Works",
    currentLoad: 12,
    capacity: 20,
    availableCapacity: 8,
    canTakeAssignment: true,
    members: [
      { name: "John Smith", email: "john.smith@example.com", role: "Team Lead" },
      { name: "Mike Johnson", email: "mike.johnson@example.com", role: "Technician" },
      { name: "Sarah Williams", email: "sarah.williams@example.com", role: "Technician" },
    ]
  },
  {
    id: "2",
    name: "Sanitation Team",
    description: "Handles waste collection, street cleaning, and litter removal",
    department: "Public Works",
    currentLoad: 18,
    capacity: 20,
    availableCapacity: 2,
    canTakeAssignment: true,
    members: [
      { name: "Robert Davis", email: "robert.davis@example.com", role: "Team Lead" },
      { name: "Lisa Brown", email: "lisa.brown@example.com", role: "Driver" },
      { name: "Tom Wilson", email: "tom.wilson@example.com", role: "Crew Member" },
    ]
  },
  {
    id: "3",
    name: "Parks & Recreation",
    description: "Maintains parks, playgrounds, and recreational facilities",
    department: "Parks & Rec",
    currentLoad: 8,
    capacity: 15,
    availableCapacity: 7,
    canTakeAssignment: true,
    members: [
      { name: "Jennifer Lee", email: "jennifer.lee@example.com", role: "Supervisor" },
      { name: "David Miller", email: "david.miller@example.com", role: "Gardener" },
      { name: "Emma Garcia", email: "emma.garcia@example.com", role: "Gardener" },
    ]
  }
]

export default function TeamsPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth()
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [loading, setLoading] = useState(false)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    department: "",
    capacity: "10"
  })
  const { toast } = useToast()

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true)
      // In a real implementation, this would fetch from the API
      // const teamsData = await api.getTeams()
      // setTeams(teamsData)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error: unknown) {
      console.error("Failed to load teams:", error)
      toast({
        title: "Error Loading Teams",
        description: error instanceof Error ? error.message : "Unable to load teams. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadTeams()
    }
  }, [isAuthenticated, authLoading, loadTeams])

  const handleCreateTeam = () => {
    if (!newTeam.name.trim() || !newTeam.department.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      description: newTeam.description,
      department: newTeam.department,
      currentLoad: 0,
      capacity: parseInt(newTeam.capacity),
      availableCapacity: parseInt(newTeam.capacity),
      canTakeAssignment: true,
      members: []
    }

    setTeams((prev) => [team, ...prev])
    setNewTeam({ name: "", description: "", department: "", capacity: "10" })
    setIsCreateTeamOpen(false)

    toast({
      title: "Team Created!",
      description: `The team "${team.name}" has been successfully created.`,
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground">Manage and assign teams for issue resolution</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team to handle community issues and assignments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team-name">Team Name *</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      placeholder="Enter department"
                      value={newTeam.department}
                      onChange={(e) => setNewTeam((prev) => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the team's responsibilities"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam((prev) => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="capacity">Team Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="100"
                      value={newTeam.capacity}
                      onChange={(e) => setNewTeam((prev) => ({ ...prev, capacity: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTeam} className="flex-1">
                      Create Team
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={loadTeams} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teams.filter(t => t.canTakeAssignment).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.reduce((sum, team) => sum + team.capacity, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {teams.reduce((sum, team) => sum + team.availableCapacity, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No teams found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first team.
                </p>
                <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <TeamTable teams={teams} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}