import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { fileURLToPath } from "url"
import { seedInMemoryDatabase, seedMongoDatabase } from "./seed-database.js"
import { Report } from "./models/report.js"
import reportsRoutes from "./routes/reports.js"
import aiRoutes from "./routes/ai.js"
import authRoutes from "./routes/auth.js"
import teamsRoutes from "./routes/teams.js"
import analyticsRoutes from "./routes/analytics.js"
import webhookRoutes from "./routes/webhooks.js"
import mediaRoutes from "./routes/media.js"
import notificationService from "./services/notificationService.js"
import { authenticateAdmin, requirePermission } from "./middleware/adminAuth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local in the parent directory
// Enhanced loading with multiple fallbacks
const envPaths = [
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env')
]

// Try to load environment variables from multiple possible locations
let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    console.log(`[CivicSense] Loaded environment variables from: ${envPath}`)
    envLoaded = true
    break
  }
}

// If no .env file found, try default loading
if (!envLoaded) {
  dotenv.config()
  console.log('[CivicSense] Using default environment variable loading')
}

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.warn(`[CivicSense] WARNING: Missing required environment variables: ${missingEnvVars.join(', ')}`)
  console.log('[CivicSense] Using default values for missing variables')
}

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image and video files are allowed!"), false)
    }
  },
})

// MongoDB connection setup
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/civicsense"
let useDatabase = false
let reports = []

async function connectToDatabase() {
  console.log(`[CivicSense] MongoDB URI found: ${MONGODB_URI ? 'Yes' : 'No'}`)
  if (MONGODB_URI) {
    console.log(`[CivicSense] Attempting connection to: ${MONGODB_URI.replace(/:\/\/[^:]*:[^@]*@/, '://***:***@')}`)
    console.log(`[CivicSense] Node.js version: ${process.version}`)
    
    // Check Node.js version compatibility
    if (!process.version.startsWith('v20.')) {
      console.warn('[CivicSense] Warning: This project is designed for Node.js v20.x for optimal MongoDB compatibility')
      console.warn('[CivicSense] Current version may cause SSL/TLS connection issues with MongoDB Atlas')
    }
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      // Add SSL/TLS options for better compatibility
      tls: true,
      tlsInsecure: false,
    })
    console.log(`[CivicSense] Connected to MongoDB successfully`)
    console.log(`[CivicSense] Database: ${mongoose.connection.db.databaseName}`)
    
    // Seed database if empty
    await seedMongoDatabase(mongoose, Report)
    useDatabase = true
    console.log("[CivicSense] Database mode: MongoDB enabled")
  } catch (error) {
    console.error(`[CivicSense] MongoDB connection error:`, error.message)
    
    // Provide specific guidance based on error type
    if (error.message.includes('tlsv1 alert internal error')) {
      console.error('[CivicSense] SSL/TLS compatibility issue detected.')
      console.error('[CivicSense] This is commonly caused by Node.js version incompatibility.')
      console.error('[CivicSense] Please use Node.js v20.x for MongoDB Atlas compatibility.')
      console.error('[CivicSense] Current Node.js version:', process.version)
    } else if (error.message.includes('AuthenticationFailed')) {
      console.error('[CivicSense] Authentication failed. Please check your MongoDB credentials.')
      console.error('[CivicSense] Ensure your MONGODB_URI in .env.local has correct username/password.')
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('[CivicSense] DNS resolution failed. Check your MongoDB URI and network connectivity.')
    }
    
    console.log("[CivicSense] Falling back to in-memory mode")
    reports = seedInMemoryDatabase()
    useDatabase = false
    global.reports = reports
  }
}

// Initialize database connection
console.log('[CivicSense] Attempting database connection...')
connectToDatabase()

let reportIdCounter = 1

// Helper function to generate tracking ID
function generateTrackingId() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `RPT-${dateStr}-${randomNum}`
}

// Routes

// Health check
app.get("/health", async (req, res) => {
  try {
    let reportsCount = 0
    if (useDatabase) {
      reportsCount = await Report.countDocuments()
    } else {
      reportsCount = reports.length
    }
    
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      reportsCount,
      databaseMode: useDatabase ? "MongoDB" : "In-Memory",
    })
  } catch (error) {
    console.error("Health check error:", error)
    res.status(500).json({ error: "Health check failed" })
  }
})

// Admin authentication and team management routes
app.use("/reports", reportsRoutes)
app.use("/auth", authRoutes)
app.use("/teams", teamsRoutes)
app.use("/ai", aiRoutes)
app.use("/analytics", analyticsRoutes)
app.use("/webhooks", webhookRoutes)
app.use("/media", mediaRoutes)

// Admin reports endpoint (protected)
app.get("/admin/reports", authenticateAdmin, async (req, res) => {
  try {
    const { format, status, severity, assignedTo, category, limit, offset, sortBy, sortOrder } = req.query

    let filteredReports
    if (useDatabase) {
      // Query from MongoDB
      let query = {}
      
      // Filter by status if provided
      if (status) {
        query.status = status
      }
      
      // Filter by severity if provided
      if (severity) {
        query.priority = severity
      }
      
      // Filter by assignedTo if provided
      if (assignedTo) {
        query.assignedTo = assignedTo
      }
      
      // Filter by category if provided
      if (category) {
        query.category = category
      }
      
      // Only include reports with location for map view
      if (format === "map") {
        query["location.lat"] = { $exists: true, $ne: null }
        query["location.lng"] = { $exists: true, $ne: null }
      }
      
      let dbQuery = Report.find(query)
      
      // Add sorting
      const sortField = sortBy || "createdAt"
      const sortDirection = sortOrder === "asc" ? 1 : -1
      dbQuery = dbQuery.sort({ [sortField]: sortDirection })
      
      // Add pagination
      if (offset) {
        const offsetNum = Number.parseInt(offset, 10)
        if (!isNaN(offsetNum) && offsetNum >= 0) {
          dbQuery = dbQuery.skip(offsetNum)
        }
      }
      
      // Limit results if specified
      if (limit) {
        const limitNum = Number.parseInt(limit, 10)
        if (!isNaN(limitNum) && limitNum > 0) {
          dbQuery = dbQuery.limit(limitNum)
        }
      }
      
      filteredReports = await dbQuery.exec()
      
      // Get total count for pagination
      const total = await Report.countDocuments(query)
      
      res.json({
        reports: filteredReports,
        pagination: {
          total,
          offset: Number.parseInt(offset, 10) || 0,
          limit: Number.parseInt(limit, 10) || total,
          hasMore: (Number.parseInt(offset, 10) || 0) + filteredReports.length < total
        }
      })
    } else {
      // Use in-memory data
      filteredReports = reports.filter((report) => {
        if (status && report.status !== status) return false
        if (severity && report.priority !== severity) return false
        if (assignedTo && report.assignedTo !== assignedTo) return false
        if (category && report.category !== category) return false
        
        // Only include reports with valid location data for map view
        if (format === "map") {
          return report.location && report.location.lat && report.location.lng
        }
        return true
      })
      
      // Sort reports
      const sortField = sortBy || "createdAt"
      const sortDirection = sortOrder === "asc" ? 1 : -1
      filteredReports.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        if (aValue < bValue) return -1 * sortDirection
        if (aValue > bValue) return 1 * sortDirection
        return 0
      })
      
      // Apply pagination
      const offsetNum = Number.parseInt(offset, 10) || 0
      const limitNum = Number.parseInt(limit, 10) || filteredReports.length
      const paginatedReports = filteredReports.slice(offsetNum, offsetNum + limitNum)
      
      res.json({
        reports: paginatedReports,
        pagination: {
          total: filteredReports.length,
          offset: offsetNum,
          limit: limitNum,
          hasMore: offsetNum + paginatedReports.length < filteredReports.length
        }
      })
    }
  } catch (error) {
    console.error("Admin reports error:", error)
    res.status(500).json({ error: "Failed to fetch admin reports" })
  }
})

// Create report endpoint
app.post("/reports", upload.single("media"), async (req, res) => {
  try {
    const { description, contactInfo, anonymous, useLocation, location } = req.body

    // Validate required fields
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description is required" })
    }

    // Generate tracking ID and report ID
    const trackingId = generateTrackingId()
    const reportId = reportIdCounter++

    // Parse location if provided
    let parsedLocation = null
    if (useLocation === "true" && location) {
      try {
        parsedLocation = JSON.parse(location)
      } catch (e) {
        console.warn("Failed to parse location:", location)
      }
    }

    // Create report object
    const reportData = {
      trackingId,
      description: description.trim(),
      contactInfo: contactInfo || null,
      anonymous: anonymous === "true",
      useLocation: useLocation === "true",
      location: parsedLocation,
      media: req.file
        ? {
            url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : null,
      status: "reported",
      createdBy: anonymous === "true" ? "anonymous" : contactInfo || "unknown",
      assignedTo: null,
      priority: "medium",
      category: "other",
      aiAnalysis: null,
      updates: [],
    }

    let savedReport
    if (useDatabase) {
      // Save to MongoDB
      const report = new Report(reportData)
      savedReport = await report.save()
      console.log(`[CivicSense] New report saved to database: ${trackingId}`)
    } else {
      // Store in-memory
      const report = {
        id: reportId.toString(),
        ...reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      reports.push(report)
      savedReport = report
      console.log(`[CivicSense] New report created in-memory: ${trackingId}`)
    }

    // Send in-app notification
    notificationService.sendInAppNotification("report.created", {
      trackingId: savedReport.trackingId,
      description: savedReport.description,
      location: savedReport.location,
      anonymous: savedReport.anonymous,
    })

    // Queue email notification if contact info provided
    if (!savedReport.anonymous && savedReport.contactInfo) {
      notificationService.queueEmailNotification(
        savedReport.contactInfo,
        `Report Submitted - ${trackingId}`,
        `Your report has been submitted successfully. Tracking ID: ${trackingId}`,
        { report: savedReport },
      )
    }

    // Queue WhatsApp notification (placeholder)
    if (!savedReport.anonymous && savedReport.contactInfo) {
      notificationService.queueWhatsAppNotification(
        savedReport.contactInfo,
        `Your report ${trackingId} has been submitted successfully. We'll keep you updated on the progress.`,
        { report: savedReport },
      )
    }

    // Return response
    res.status(201).json({
      trackingId,
      id: savedReport._id || savedReport.id,
      message: "Report submitted successfully",
    })
  } catch (error) {
    console.error("Create report error:", error)
    res.status(500).json({ error: "Failed to create report" })
  }
})

// Get all reports endpoint
app.get("/reports", async (req, res) => {
  try {
    const { format, status, severity, limit } = req.query

    let filteredReports
    if (useDatabase) {
      // Query from MongoDB
      let query = {}
      
      // Filter by status if provided
      if (status) {
        query.status = status
      }
      
      // Filter by severity if provided
      if (severity) {
        query.priority = severity
      }
      
      // Only include reports with location for map view
      if (format === "map") {
        query["location.lat"] = { $exists: true, $ne: null }
        query["location.lng"] = { $exists: true, $ne: null }
      }
      
      let dbQuery = Report.find(query).sort({ createdAt: -1 })
      
      // Limit results if specified
      if (limit) {
        const limitNum = Number.parseInt(limit, 10)
        if (!isNaN(limitNum) && limitNum > 0) {
          dbQuery = dbQuery.limit(limitNum)
        }
      }
      
      filteredReports = await dbQuery.exec()
    } else {
      // Use in-memory data
      filteredReports = reports.filter((report) => {
        // Only include reports with valid location data for map view
        if (format === "map") {
          return report.location && report.location.lat && report.location.lng
        }
        return true
      })

      // Filter by status if provided
      if (status) {
        filteredReports = filteredReports.filter((report) => report.status === status)
      }

      // Filter by severity if provided
      if (severity) {
        filteredReports = filteredReports.filter((report) => report.priority === severity)
      }

      // Limit results if specified
      if (limit) {
        const limitNum = Number.parseInt(limit, 10)
        if (!isNaN(limitNum) && limitNum > 0) {
          filteredReports = filteredReports.slice(0, limitNum)
        }
      }
    }

    // Format reports for public view
    const publicReports = filteredReports.map((report) => {
      const baseReport = {
        _id: report._id || report.id,
        title: `Issue Report #${report.trackingId.split("-").pop()}`,
        description: report.description,
        status: report.status,
        severity: report.priority,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        trackingId: report.trackingId,
        contactInfo: report.anonymous ? null : report.contactInfo,
        createdBy: report.anonymous ? "anonymous" : report.createdBy,
      }

      // Add location data if available
      if (report.location) {
        baseReport.location = {
          lat: report.location.lat,
          lng: report.location.lng,
          address: report.location.address || null,
        }
      }

      // Add media URL if available
      if (report.media) {
        baseReport.mediaUrl = report.media.url
      }

      return baseReport
    })

    res.json(publicReports)
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Failed to fetch reports" })
  }
})

// Get report by tracking ID
app.get("/reports/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params
    let report
    
    if (useDatabase) {
      report = await Report.findOne({ trackingId })
    } else {
      report = reports.find((r) => r.trackingId === trackingId)
    }

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    // Return report (excluding sensitive info for anonymous reports)
    const publicReport = {
      ...report.toObject ? report.toObject() : report,
      contactInfo: report.anonymous ? null : report.contactInfo,
      createdBy: report.anonymous ? "anonymous" : report.createdBy,
    }

    res.json(publicReport)
  } catch (error) {
    console.error("Get report error:", error)
    res.status(500).json({ error: "Failed to fetch report" })
  }
})

// Admin-only reports endpoints for assignment and status updates
// Admin endpoint to assign report to team
app.patch("/reports/:id/assign", authenticateAdmin, requirePermission("assign-reports"), async (req, res) => {
  try {
    const { id } = req.params
    const { teamId, assignedBy } = req.body

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" })
    }

    let report
    if (useDatabase) {
      report = await Report.findOne({ $or: [{ _id: id }, { trackingId: id }] })
      if (!report) {
        return res.status(404).json({ error: "Report not found" })
      }
      
      // Update report assignment
      report.assignedTo = teamId
      report.updatedAt = new Date()
      
      // Add update to report history
      report.updates.push({
        type: "assignment",
        message: `Report assigned to team ${teamId}`,
        createdBy: assignedBy || req.admin.username,
        createdAt: new Date(),
      })
      
      await report.save()
    } else {
      const reportIndex = reports.findIndex((r) => r.id === id)
      if (reportIndex === -1) {
        return res.status(404).json({ error: "Report not found" })
      }

      // Update report assignment
      reports[reportIndex].assignedTo = teamId
      reports[reportIndex].updatedAt = new Date().toISOString()

      // Add update to report history
      reports[reportIndex].updates.push({
        type: "assignment",
        message: `Report assigned to team ${teamId}`,
        createdBy: assignedBy || req.admin.username,
        createdAt: new Date().toISOString(),
      })
      
      report = reports[reportIndex]
    }

    console.log(`[CivicSense] Report ${id} assigned to team ${teamId} by ${req.admin.username}`)

    res.json({
      message: "Report assigned successfully",
      report: {
        id: report._id || report.id,
        trackingId: report.trackingId,
        assignedTo: report.assignedTo,
        updatedAt: report.updatedAt,
      },
    })
  } catch (error) {
    console.error("Assign report error:", error)
    res.status(500).json({ error: "Failed to assign report" })
  }
})

// Admin endpoint to update report status
app.patch("/reports/:id/status", authenticateAdmin, requirePermission("update-status"), async (req, res) => {
  try {
    const { id } = req.params
    const { status, note, updatedBy } = req.body

    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    const validStatuses = ["reported", "in-review", "in-progress", "resolved", "closed"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      })
    }

    let report
    let oldStatus
    
    if (useDatabase) {
      report = await Report.findOne({ $or: [{ _id: id }, { trackingId: id }] })
      if (!report) {
        return res.status(404).json({ error: "Report not found" })
      }
      
      oldStatus = report.status
      
      // Update report status
      report.status = status
      report.updatedAt = new Date()
      
      // Add update to report history
      const updateMessage = note
        ? `Status changed from ${oldStatus} to ${status}: ${note}`
        : `Status changed from ${oldStatus} to ${status}`

      report.updates.push({
        type: "status",
        message: updateMessage,
        createdBy: updatedBy || req.admin.username,
        createdAt: new Date(),
        oldStatus,
        newStatus: status,
        note: note || null,
      })
      
      await report.save()
    } else {
      const reportIndex = reports.findIndex((r) => r.id === id)
      if (reportIndex === -1) {
        return res.status(404).json({ error: "Report not found" })
      }

      oldStatus = reports[reportIndex].status
      report = reports[reportIndex]

      // Update report status
      reports[reportIndex].status = status
      reports[reportIndex].updatedAt = new Date().toISOString()

      // Add update to report history
      const updateMessage = note
        ? `Status changed from ${oldStatus} to ${status}: ${note}`
        : `Status changed from ${oldStatus} to ${status}`

      reports[reportIndex].updates.push({
        type: "status",
        message: updateMessage,
        createdBy: updatedBy || req.admin.username,
        createdAt: new Date().toISOString(),
        oldStatus,
        newStatus: status,
        note: note || null,
      })
    }

    console.log(`[CivicSense] Report ${id} status updated to ${status} by ${req.admin.username}`)

    // Send in-app notification
    notificationService.sendInAppNotification("report.status_changed", {
      trackingId: report.trackingId,
      oldStatus,
      newStatus: status,
      note,
      updatedBy: updatedBy || req.admin.username,
    })

    // Queue email notification if contact info available
    if (!report.anonymous && report.contactInfo) {
      notificationService.queueEmailNotification(
        report.contactInfo,
        `Report Update - ${report.trackingId}`,
        `Your report status has been updated to: ${status}${note ? `. Note: ${note}` : ""}`,
        { report, oldStatus, newStatus: status, note },
      )
    }

    // Queue WhatsApp notification
    if (!report.anonymous && report.contactInfo) {
      notificationService.queueWhatsAppNotification(
        report.contactInfo,
        `Update on your report ${report.trackingId}: Status changed to ${status}${note ? `. ${note}` : ""}`,
        { report, oldStatus, newStatus: status, note },
      )
    }

    res.json({
      message: "Report status updated successfully",
      report: {
        id: report._id || report.id,
        trackingId: report.trackingId,
        status: report.status,
        updatedAt: report.updatedAt,
        updates: report.updates,
      },
    })
  } catch (error) {
    console.error("Update report status error:", error)
    res.status(500).json({ error: "Failed to update report status" })
  }
})

// Admin endpoint to get all reports with full details
app.get("/admin/reports", authenticateAdmin, requirePermission("view-reports"), async (req, res) => {
  try {
    const {
      format,
      status,
      severity,
      assignedTo,
      category,
      limit,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    let filteredReports
    
    if (useDatabase) {
      // Build MongoDB query
      let query = {}
      
      // Apply filters
      if (format === "map") {
        query["location.lat"] = { $exists: true, $ne: null }
        query["location.lng"] = { $exists: true, $ne: null }
      }
      
      if (status) {
        query.status = status
      }
      
      if (severity) {
        query.priority = severity
      }
      
      if (assignedTo) {
        query.assignedTo = assignedTo
      }
      
      if (category) {
        query.category = category
      }
      
      // Build sort object
      const sort = {}
      sort[sortBy] = sortOrder === "desc" ? -1 : 1
      
      // Apply pagination
      const offsetNum = Number.parseInt(offset, 10) || 0
      const limitNum = limit ? Number.parseInt(limit, 10) : 0
      
      let dbQuery = Report.find(query).sort(sort)
      
      if (limitNum > 0) {
        dbQuery = dbQuery.skip(offsetNum).limit(limitNum)
      }
      
      filteredReports = await dbQuery.exec()
      
      // Get total count for pagination
      const totalCount = await Report.countDocuments(query)
      
      // Return response with pagination info
      const adminReports = filteredReports.map((report) => ({
        ...report.toObject(),
        title: `Issue Report #${report.trackingId.split("-").pop()}`,
        mediaUrl: report.media?.url || null,
      }))

      return res.json({
        reports: adminReports,
        pagination: {
          total: totalCount,
          offset: offsetNum,
          limit: limitNum || totalCount,
          hasMore: offsetNum + (limitNum || totalCount) < totalCount,
        },
      })
    } else {
      // Use in-memory data
      filteredReports = [...reports]

      // Apply filters
      if (format === "map") {
        filteredReports = filteredReports.filter(
          (report) => report.location && report.location.lat && report.location.lng,
        )
      }

      if (status) {
        filteredReports = filteredReports.filter((report) => report.status === status)
      }

      if (severity) {
        filteredReports = filteredReports.filter((report) => report.priority === severity)
      }

      if (assignedTo) {
        filteredReports = filteredReports.filter((report) => report.assignedTo === assignedTo)
      }

      if (category) {
        filteredReports = filteredReports.filter((report) => report.category === category)
      }

      // Sort reports
      filteredReports.sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]

        if (sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        }
      })

      // Apply pagination
      const offsetNum = Number.parseInt(offset, 10) || 0
      const limitNum = limit ? Number.parseInt(limit, 10) : filteredReports.length
      const paginatedReports = filteredReports.slice(offsetNum, offsetNum + limitNum)

      // Return full report details for admin
      const adminReports = paginatedReports.map((report) => ({
        ...report,
        // Include all fields for admin view
        title: `Issue Report #${report.trackingId.split("-").pop()}`,
        mediaUrl: report.media?.url || null,
      }))

      res.json({
        reports: adminReports,
        pagination: {
          total: filteredReports.length,
          offset: offsetNum,
          limit: limitNum,
          hasMore: offsetNum + limitNum < filteredReports.length,
        },
      })
    }
  } catch (error) {
    console.error("Get admin reports error:", error)
    res.status(500).json({ error: "Failed to fetch reports" })
  }
})

// Notification status endpoint
app.get("/notifications/status", (req, res) => {
  try {
    const status = notificationService.getQueueStatus()
    res.json({
      status: "OK",
      queues: status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get notification status error:", error)
    res.status(500).json({ error: "Failed to get notification status" })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." })
    }
  }

  console.error("Unhandled error:", error)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" })
})

// Start server
app.listen(PORT, () => {
  console.log(`[CivicSense] Backend Server running on port ${PORT}`)
  console.log(`[CivicSense] Health check: http://localhost:${PORT}/health`)
  console.log(`[CivicSense] Loaded ${reports.length} seed reports`)
  console.log(`[CivicSense] API endpoints:`)
  console.log(`[CivicSense]   POST /media/upload - Upload media files`)
  console.log(`[CivicSense]   POST /reports - Create new report`)
  console.log(`[CivicSense]   GET /reports - Get all reports`)
  console.log(`[CivicSense]   GET /reports/:trackingId - Get specific report`)
  console.log(`[CivicSense]   POST /auth/login - Admin login`)
  console.log(`[CivicSense]   POST /auth/guest - Guest admin token`)
  console.log(`[CivicSense]   GET /auth/verify - Verify admin token`)
  console.log(`[CivicSense]   GET /teams - Get all teams`)
  console.log(`[CivicSense]   POST /teams - Create new team`)
  console.log(`[CivicSense]   PATCH /teams/:id/assign - Assign reports to team`)
  console.log(`[CivicSense]   GET /admin/reports - Get all reports (admin view)`)
  console.log(`[CivicSense]   PATCH /reports/:id/assign - Assign report to team`)
  console.log(`[CivicSense]   PATCH /reports/:id/status - Update report status`)
  console.log(`[CivicSense]   POST /ai/analyze-image - AI image analysis`)
  console.log(`[CivicSense]   POST /ai/generate-description - AI description generation`)
  console.log(`[CivicSense]   POST /ai/transcribe - AI audio transcription`)
  console.log(`[CivicSense]   GET /ai/status - AI service status`)
  console.log(`[CivicSense]   POST /webhooks/whatsapp - WhatsApp webhook`)
  console.log(`[CivicSense]   GET /webhooks/whatsapp - WhatsApp webhook verification`)
  console.log(`[CivicSense]   GET /notifications/status - Notification queue status`)
  console.log(
    `[CivicSense] AI Service: ${process.env.GEMINI_KEY ? "Gemini configured" : "Mock mode (set GEMINI_KEY for real AI)"}`,
  )
  console.log(
    `[CivicSense] WhatsApp API: ${process.env.WHATSAPP_API ? "Configured" : "TODO: Set WHATSAPP_API environment variable"}`,
  )
  console.log(`[CivicSense] Admin Credentials:`)
  console.log(`[CivicSense]   Username: admin, Password: admin123`)
  console.log(`[CivicSense]   Username: moderator, Password: mod123`)
  console.log(`[CivicSense]   Guest Password: guest123`)
})
