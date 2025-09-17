import express from "express"
import { authenticateAdmin, requirePermission } from "../middleware/adminAuth.js"

const router = express.Router()

// In-memory teams storage (replace with database in production)
const teams = [
  {
    id: "1",
    name: "Public Works Alpha",
    description: "Primary infrastructure maintenance and repair team",
    department: "public-works",
    members: [
      { name: "John Smith", email: "j.smith@city.gov", role: "lead" },
      { name: "Maria Garcia", email: "m.garcia@city.gov", role: "member" },
      { name: "David Chen", email: "d.chen@city.gov", role: "specialist" },
    ],
    specialties: ["infrastructure", "maintenance"],
    capacity: 8,
    currentLoad: 3,
    assignedReports: [
      { reportId: "1", assignedAt: new Date().toISOString(), priority: "high" },
      { reportId: "3", assignedAt: new Date().toISOString(), priority: "medium" },
      { reportId: "7", assignedAt: new Date().toISOString(), priority: "low" },
    ],
    isActive: true,
    contactInfo: {
      phone: "(555) 123-4567",
      email: "publicworks.alpha@city.gov",
      location: "City Maintenance Facility A",
    },
    workingHours: {
      start: "08:00",
      end: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Emergency Response Unit",
    description: "Rapid response team for urgent safety issues",
    department: "emergency-services",
    members: [
      { name: "Sarah Johnson", email: "s.johnson@city.gov", role: "lead" },
      { name: "Mike Rodriguez", email: "m.rodriguez@city.gov", role: "member" },
      { name: "Lisa Park", email: "l.park@city.gov", role: "member" },
    ],
    specialties: ["safety", "emergency"],
    capacity: 6,
    currentLoad: 1,
    assignedReports: [{ reportId: "5", assignedAt: new Date().toISOString(), priority: "urgent" }],
    isActive: true,
    contactInfo: {
      phone: "(555) 911-0000",
      email: "emergency@city.gov",
      location: "Emergency Services HQ",
    },
    workingHours: {
      start: "00:00",
      end: "23:59",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Environmental Services",
    description: "Environmental cleanup and monitoring specialists",
    department: "environmental",
    members: [
      { name: "Dr. Amanda White", email: "a.white@city.gov", role: "lead" },
      { name: "Carlos Martinez", email: "c.martinez@city.gov", role: "specialist" },
    ],
    specialties: ["environment"],
    capacity: 4,
    currentLoad: 2,
    assignedReports: [
      { reportId: "2", assignedAt: new Date().toISOString(), priority: "medium" },
      { reportId: "6", assignedAt: new Date().toISOString(), priority: "high" },
    ],
    isActive: true,
    contactInfo: {
      phone: "(555) 234-5678",
      email: "environmental@city.gov",
      location: "Environmental Services Building",
    },
    workingHours: {
      start: "08:00",
      end: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Parks & Recreation Crew",
    description: "Maintenance and improvement of public parks and recreational facilities",
    department: "parks-recreation",
    members: [
      { name: "Tom Wilson", email: "t.wilson@city.gov", role: "lead" },
      { name: "Jennifer Lee", email: "j.lee@city.gov", role: "member" },
      { name: "Robert Brown", email: "r.brown@city.gov", role: "member" },
    ],
    specialties: ["public-services", "maintenance"],
    capacity: 7,
    currentLoad: 4,
    assignedReports: [
      { reportId: "4", assignedAt: new Date().toISOString(), priority: "low" },
      { reportId: "8", assignedAt: new Date().toISOString(), priority: "medium" },
      { reportId: "9", assignedAt: new Date().toISOString(), priority: "medium" },
      { reportId: "10", assignedAt: new Date().toISOString(), priority: "low" },
    ],
    isActive: true,
    contactInfo: {
      phone: "(555) 345-6789",
      email: "parks@city.gov",
      location: "Parks Department Office",
    },
    workingHours: {
      start: "08:00",
      end: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let teamIdCounter = teams.length + 1

// Get all teams
router.get("/", authenticateAdmin, requirePermission("view-reports"), (req, res) => {
  try {
    const { department, specialty, available } = req.query

    let filteredTeams = teams.filter((team) => team.isActive)

    // Filter by department
    if (department) {
      filteredTeams = filteredTeams.filter((team) => team.department === department)
    }

    // Filter by specialty
    if (specialty) {
      filteredTeams = filteredTeams.filter((team) => team.specialties.includes(specialty))
    }

    // Filter by availability
    if (available === "true") {
      filteredTeams = filteredTeams.filter((team) => team.currentLoad < team.capacity)
    }

    // Add computed fields
    const teamsWithStats = filteredTeams.map((team) => ({
      ...team,
      availableCapacity: team.capacity - team.currentLoad,
      utilizationRate: Math.round((team.currentLoad / team.capacity) * 100),
      canTakeAssignment: team.currentLoad < team.capacity,
    }))

    res.json(teamsWithStats)
  } catch (error) {
    console.error("Get teams error:", error)
    res.status(500).json({ error: "Failed to fetch teams" })
  }
})

// Get team by ID
router.get("/:id", authenticateAdmin, requirePermission("view-reports"), (req, res) => {
  try {
    const { id } = req.params
    const team = teams.find((t) => t.id === id && t.isActive)

    if (!team) {
      return res.status(404).json({ error: "Team not found" })
    }

    // Add computed fields
    const teamWithStats = {
      ...team,
      availableCapacity: team.capacity - team.currentLoad,
      utilizationRate: Math.round((team.currentLoad / team.capacity) * 100),
      canTakeAssignment: team.currentLoad < team.capacity,
    }

    res.json(teamWithStats)
  } catch (error) {
    console.error("Get team error:", error)
    res.status(500).json({ error: "Failed to fetch team" })
  }
})

// Create new team
router.post("/", authenticateAdmin, requirePermission("manage-teams"), (req, res) => {
  try {
    const { name, description, department, members, specialties, capacity, contactInfo, workingHours } = req.body

    // Validate required fields
    if (!name || !department) {
      return res.status(400).json({ error: "Name and department are required" })
    }

    // Create new team
    const newTeam = {
      id: (teamIdCounter++).toString(),
      name: name.trim(),
      description: description?.trim() || '',
      department,
      members: members || [],
      specialties: specialties || [],
      capacity: capacity || 5,
      currentLoad: 0,
      assignedReports: [],
      isActive: true,
      contactInfo: contactInfo || {},
      workingHours: workingHours || {
        start: '08:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    teams.push(newTeam)

    console.log(`[v0] New team created: ${newTeam.name} (ID: ${newTeam.id})`)

    res.status(201).json(newTeam)
  } catch (error) {
    console.error("Create team error:", error)
    res.status(500).json({ error: "Failed to create team" })
  }
})

// Update team
router.patch("/:id", authenticateAdmin, requirePermission("manage-teams"), (req, res) => {
  try {
    const { id } = req.params
    const teamIndex = teams.findIndex((t) => t.id === id && t.isActive)

    if (teamIndex === -1) {
      return res.status(404).json({ error: "Team not found" })
    }

    // Update team fields
    const allowedUpdates = [
      "name",
      "description",
      "department",
      "members",
      "specialties",
      "capacity",
      "contactInfo",
      "workingHours",
      "isActive",
    ]

    const updates = {}
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    // Update the team
    teams[teamIndex] = {
      ...teams[teamIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    console.log(`[v0] Team updated: ${teams[teamIndex].name} (ID: ${id})`)

    res.json(teams[teamIndex])
  } catch (error) {
    console.error("Update team error:", error)
    res.status(500).json({ error: "Failed to update team" })
  }
})

// Assign reports to team
router.patch("/:id/assign", authenticateAdmin, requirePermission("assign-reports"), (req, res) => {
  try {
    const { id } = req.params
    const { reportIds, priority = "medium" } = req.body

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: "Report IDs array is required" })
    }

    const teamIndex = teams.findIndex((t) => t.id === id && t.isActive)
    if (teamIndex === -1) {
      return res.status(404).json({ error: "Team not found" })
    }

    const team = teams[teamIndex]

    // Check if team can take more assignments
    if (team.currentLoad + reportIds.length > team.capacity) {
      return res.status(400).json({
        error: `Team capacity exceeded. Available: ${team.capacity - team.currentLoad}, Requested: ${reportIds.length}`,
      })
    }

    // Add assignments
    const newAssignments = reportIds.map((reportId) => ({
      reportId: reportId.toString(),
      assignedAt: new Date().toISOString(),
      priority,
    }))

    team.assignedReports.push(...newAssignments)
    team.currentLoad += reportIds.length
    team.updatedAt = new Date().toISOString()

    console.log(`[v0] Reports assigned to team ${team.name}: ${reportIds.join(", ")}`)

    res.json({
      message: `${reportIds.length} report(s) assigned successfully`,
      team: {
        id: team.id,
        name: team.name,
        currentLoad: team.currentLoad,
        capacity: team.capacity,
        availableCapacity: team.capacity - team.currentLoad,
        assignedReports: team.assignedReports,
      },
    })
  } catch (error) {
    console.error("Assign reports error:", error)
    res.status(500).json({ error: "Failed to assign reports" })
  }
})

// Unassign report from team
router.patch("/:id/unassign", authenticateAdmin, requirePermission("assign-reports"), (req, res) => {
  try {
    const { id } = req.params
    const { reportId } = req.body

    if (!reportId) {
      return res.status(400).json({ error: "Report ID is required" })
    }

    const teamIndex = teams.findIndex((t) => t.id === id && t.isActive)
    if (teamIndex === -1) {
      return res.status(404).json({ error: "Team not found" })
    }

    const team = teams[teamIndex]
    const assignmentIndex = team.assignedReports.findIndex((assignment) => assignment.reportId === reportId.toString())

    if (assignmentIndex === -1) {
      return res.status(404).json({ error: "Report assignment not found" })
    }

    // Remove assignment
    team.assignedReports.splice(assignmentIndex, 1)
    team.currentLoad = Math.max(0, team.currentLoad - 1)
    team.updatedAt = new Date().toISOString()

    console.log(`[v0] Report ${reportId} unassigned from team ${team.name}`)

    res.json({
      message: "Report unassigned successfully",
      team: {
        id: team.id,
        name: team.name,
        currentLoad: team.currentLoad,
        capacity: team.capacity,
        availableCapacity: team.capacity - team.currentLoad,
      },
    })
  } catch (error) {
    console.error("Unassign report error:", error)
    res.status(500).json({ error: "Failed to unassign report" })
  }
})

// Delete team (soft delete)
router.delete("/:id", authenticateAdmin, requirePermission("manage-teams"), (req, res) => {
  try {
    const { id } = req.params
    const teamIndex = teams.findIndex((t) => t.id === id)

    if (teamIndex === -1) {
      return res.status(404).json({ error: "Team not found" })
    }

    // Soft delete - mark as inactive
    teams[teamIndex].isActive = false
    teams[teamIndex].updatedAt = new Date().toISOString()

    console.log(`[v0] Team deleted: ${teams[teamIndex].name} (ID: ${id})`)

    res.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Delete team error:", error)
    res.status(500).json({ error: "Failed to delete team" })
  }
})

export default router
