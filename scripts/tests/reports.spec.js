import request from "supertest"
import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mock the seed database
const mockReports = [
  {
    id: "1",
    trackingId: "RPT-20241215-0001",
    description: "Test pothole on Main Street",
    status: "reported",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    anonymous: false,
    contactInfo: "test@example.com",
    location: { lat: 40.7128, lng: -74.006, address: "Main Street" },
    priority: "medium",
    category: "infrastructure",
    updates: [],
  },
]

// Create test app
function createTestApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Mock multer for file uploads
  const upload = multer({ dest: "/tmp/" })

  // Mock global reports array
  global.reports = [...mockReports]
  let reportIdCounter = mockReports.length + 1

  // Helper function to generate tracking ID
  function generateTrackingId() {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")
    return `RPT-${dateStr}-${randomNum}`
  }

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      reportsCount: global.reports.length,
    })
  })

  // Create report endpoint
  app.post("/reports", upload.single("media"), (req, res) => {
    try {
      const { description, contactInfo, anonymous, useLocation, location } = req.body

      if (!description || description.trim().length === 0) {
        return res.status(400).json({ error: "Description is required" })
      }

      const trackingId = generateTrackingId()
      const reportId = reportIdCounter++

      let parsedLocation = null
      if (useLocation === "true" && location) {
        try {
          parsedLocation = JSON.parse(location)
        } catch (e) {
          console.warn("Failed to parse location:", location)
        }
      }

      const report = {
        id: reportId.toString(),
        trackingId,
        description: description.trim(),
        contactInfo: contactInfo || null,
        anonymous: anonymous === "true",
        useLocation: useLocation === "true",
        location: parsedLocation,
        media: req.file
          ? {
              url: `http://localhost:3001/uploads/${req.file.filename}`,
              filename: req.file.filename,
              originalName: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
            }
          : null,
        status: "reported",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: anonymous === "true" ? "anonymous" : contactInfo || "unknown",
        assignedTo: null,
        priority: "medium",
        category: "other",
        aiAnalysis: null,
        updates: [],
      }

      global.reports.push(report)

      res.status(201).json({
        trackingId,
        id: report.id,
        message: "Report submitted successfully",
      })
    } catch (error) {
      console.error("Create report error:", error)
      res.status(500).json({ error: "Failed to create report" })
    }
  })

  // Get all reports endpoint
  app.get("/reports", (req, res) => {
    try {
      const { format, status, severity, limit } = req.query

      let filteredReports = global.reports.filter((report) => {
        if (format === "map") {
          return report.location && report.location.lat && report.location.lng
        }
        return true
      })

      if (status) {
        filteredReports = filteredReports.filter((report) => report.status === status)
      }

      if (severity) {
        filteredReports = filteredReports.filter((report) => report.priority === severity)
      }

      if (limit) {
        const limitNum = Number.parseInt(limit, 10)
        if (!isNaN(limitNum) && limitNum > 0) {
          filteredReports = filteredReports.slice(0, limitNum)
        }
      }

      const publicReports = filteredReports.map((report) => ({
        _id: report.id,
        title: `Issue Report #${report.trackingId.split("-").pop()}`,
        description: report.description,
        status: report.status,
        severity: report.priority,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        trackingId: report.trackingId,
        contactInfo: report.anonymous ? null : report.contactInfo,
        createdBy: report.anonymous ? "anonymous" : report.createdBy,
        location: report.location,
        mediaUrl: report.media?.url || null,
      }))

      res.json(publicReports)
    } catch (error) {
      console.error("Get reports error:", error)
      res.status(500).json({ error: "Failed to fetch reports" })
    }
  })

  // Update report status endpoint (simplified for testing)
  app.patch("/reports/:id/status", (req, res) => {
    try {
      const { id } = req.params
      const { status, note } = req.body

      if (!status) {
        return res.status(400).json({ error: "Status is required" })
      }

      const validStatuses = ["reported", "in-review", "in-progress", "resolved", "closed"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        })
      }

      const reportIndex = global.reports.findIndex((r) => r.id === id)
      if (reportIndex === -1) {
        return res.status(404).json({ error: "Report not found" })
      }

      const oldStatus = global.reports[reportIndex].status
      global.reports[reportIndex].status = status
      global.reports[reportIndex].updatedAt = new Date().toISOString()

      const updateMessage = note
        ? `Status changed from ${oldStatus} to ${status}: ${note}`
        : `Status changed from ${oldStatus} to ${status}`

      global.reports[reportIndex].updates.push({
        type: "status",
        message: updateMessage,
        createdBy: "test-admin",
        createdAt: new Date().toISOString(),
        oldStatus,
        newStatus: status,
        note: note || null,
      })

      res.json({
        message: "Report status updated successfully",
        report: {
          id: global.reports[reportIndex].id,
          trackingId: global.reports[reportIndex].trackingId,
          status: global.reports[reportIndex].status,
          updatedAt: global.reports[reportIndex].updatedAt,
          updates: global.reports[reportIndex].updates,
        },
      })
    } catch (error) {
      console.error("Update report status error:", error)
      res.status(500).json({ error: "Failed to update report status" })
    }
  })

  return app
}

describe("Reports API", () => {
  let app

  beforeEach(() => {
    app = createTestApp()
  })

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200)

      expect(response.body).toHaveProperty("status", "OK")
      expect(response.body).toHaveProperty("timestamp")
      expect(response.body).toHaveProperty("reportsCount")
    })
  })

  describe("POST /reports", () => {
    it("should create a new report successfully", async () => {
      const reportData = {
        description: "Test pothole on Oak Street",
        contactInfo: "test@example.com",
        anonymous: "false",
        useLocation: "true",
        location: JSON.stringify({ lat: 40.7589, lng: -73.9851, address: "Oak Street" }),
      }

      const response = await request(app)
        .post("/reports")
        .field("description", reportData.description)
        .field("contactInfo", reportData.contactInfo)
        .field("anonymous", reportData.anonymous)
        .field("useLocation", reportData.useLocation)
        .field("location", reportData.location)
        .expect(201)

      expect(response.body).toHaveProperty("trackingId")
      expect(response.body).toHaveProperty("id")
      expect(response.body).toHaveProperty("message", "Report submitted successfully")
      expect(response.body.trackingId).toMatch(/^RPT-\d{8}-\d{4}$/)
    })

    it("should return 400 if description is missing", async () => {
      const response = await request(app).post("/reports").field("contactInfo", "test@example.com").expect(400)

      expect(response.body).toHaveProperty("error", "Description is required")
    })

    it("should create anonymous report", async () => {
      const reportData = {
        description: "Anonymous report test",
        anonymous: "true",
        useLocation: "false",
      }

      const response = await request(app)
        .post("/reports")
        .field("description", reportData.description)
        .field("anonymous", reportData.anonymous)
        .field("useLocation", reportData.useLocation)
        .expect(201)

      expect(response.body).toHaveProperty("trackingId")
      expect(response.body).toHaveProperty("message", "Report submitted successfully")
    })
  })

  describe("GET /reports", () => {
    it("should return all reports", async () => {
      const response = await request(app).get("/reports").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)

      const report = response.body[0]
      expect(report).toHaveProperty("_id")
      expect(report).toHaveProperty("title")
      expect(report).toHaveProperty("description")
      expect(report).toHaveProperty("status")
      expect(report).toHaveProperty("trackingId")
    })

    it("should filter reports by status", async () => {
      const response = await request(app).get("/reports?status=reported").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((report) => {
        expect(report.status).toBe("reported")
      })
    })

    it("should limit number of reports returned", async () => {
      const response = await request(app).get("/reports?limit=1").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(1)
    })

    it("should filter reports for map view", async () => {
      const response = await request(app).get("/reports?format=map").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((report) => {
        expect(report.location).toBeDefined()
        expect(report.location.lat).toBeDefined()
        expect(report.location.lng).toBeDefined()
      })
    })
  })

  describe("PATCH /reports/:id/status", () => {
    it("should update report status successfully", async () => {
      const reportId = "1"
      const newStatus = "in-progress"
      const note = "Investigation started"

      const response = await request(app)
        .patch(`/reports/${reportId}/status`)
        .send({ status: newStatus, note })
        .expect(200)

      expect(response.body).toHaveProperty("message", "Report status updated successfully")
      expect(response.body.report).toHaveProperty("status", newStatus)
      expect(response.body.report).toHaveProperty("updates")
      expect(response.body.report.updates.length).toBeGreaterThan(0)
    })

    it("should return 400 if status is missing", async () => {
      const response = await request(app).patch("/reports/1/status").send({ note: "Test note" }).expect(400)

      expect(response.body).toHaveProperty("error", "Status is required")
    })

    it("should return 400 if status is invalid", async () => {
      const response = await request(app).patch("/reports/1/status").send({ status: "invalid-status" }).expect(400)

      expect(response.body.error).toContain("Invalid status")
    })

    it("should return 404 if report not found", async () => {
      const response = await request(app).patch("/reports/999/status").send({ status: "resolved" }).expect(404)

      expect(response.body).toHaveProperty("error", "Report not found")
    })
  })
})
