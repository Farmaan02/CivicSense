import request from "supertest"
// import mongoose from "mongoose"  // Temporarily comment out mongoose import
import { app } from "./test-app.js"
// import { Report } from "../models/report.js"  // Temporarily comment out Report import

// Mock the global admins array for authentication with correct password hash
global.admins = [
  {
    id: "1",
    username: "admin",
    email: "admin@civicsense.local",
    password: "$2a$10$y44LPR5LnfUkDaeIGoJ.4emvflpoYDPEUL6HG7hvB3fUtZozRw/w6", // 'admin123' hashed
    role: "super-admin",
    permissions: [
      "view-reports",
      "assign-reports",
      "update-status",
      "manage-teams",
      "manage-users",
      "view-analytics",
      "export-data",
      "system-settings",
    ],
    profile: {
      firstName: "System",
      lastName: "Administrator",
      position: "Super Administrator",
    },
    isActive: true,
    guestToken: null,
    createdAt: new Date().toISOString(),
  }
]

describe("Reports API Integration", () => {
  beforeEach(async () => {
    // Clear the reports collection before each test
    global.reports = []
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
      expect(response.body).toHaveProperty("message", "Report submitted successfully")
      expect(response.body.trackingId).toMatch(/^RPT-\d{8}-\d{4}$/)

      // Verify the report was saved to the in-memory database
      expect(global.reports).toHaveLength(1)
      expect(global.reports[0].description).toBe(reportData.description)
    })

    it("should return 400 if description is missing", async () => {
      const response = await request(app)
        .post("/reports")
        .field("contactInfo", "test@example.com")
        .expect(400)

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
      
      // Verify the report was saved with anonymous flag
      expect(global.reports).toHaveLength(1)
      expect(global.reports[0].anonymous).toBe(true)
      expect(global.reports[0].createdBy).toBe("anonymous")
    })
  })

  describe("GET /reports", () => {
    beforeEach(async () => {
      // Create some test reports in the in-memory database
      global.reports = [
        {
          id: "1",
          trackingId: "RPT-20241215-0001",
          description: "Test pothole on Main Street",
          status: "reported",
          anonymous: false,
          contactInfo: "test@example.com",
          location: { lat: 40.7128, lng: -74.006, address: "Main Street" },
          priority: "medium",
          category: "infrastructure",
          createdBy: "test@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "2",
          trackingId: "RPT-20241215-0002",
          description: "Broken streetlight",
          status: "in-progress",
          anonymous: true,
          location: { lat: 40.7589, lng: -73.9851, address: "Oak Street" },
          priority: "high",
          category: "public-services",
          createdBy: "anonymous",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      console.log("[Test] Set up global.reports with", global.reports.length, "reports")
    })

    it("should return all reports", async () => {
      console.log("[Test] global.reports before GET /reports:", global.reports.length)
      const response = await request(app)
        .get("/reports")
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)

      const report = response.body[0]
      expect(report).toHaveProperty("_id")
      expect(report).toHaveProperty("title")
      expect(report).toHaveProperty("description")
      expect(report).toHaveProperty("status")
      expect(report).toHaveProperty("trackingId")
    })

    it("should filter reports by status", async () => {
      console.log("[Test] global.reports before GET /reports?status=in-progress:", global.reports.length)
      console.log("[Test] global.reports data:", JSON.stringify(global.reports, null, 2))
      const response = await request(app)
        .get("/reports?status=in-progress")
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].status).toBe("in-progress")
    })
  })
})