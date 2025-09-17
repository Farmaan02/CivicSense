import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { fileURLToPath } from "url"
import { Report } from "../models/report.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for report creation with media
const uploadsDir = path.join(__dirname, "../../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
    cb(null, `report-${uniqueSuffix}-${sanitizedName}`)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("File type not allowed"), false)
    }
  },
})

// Helper functions
function generateTrackingId() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `RPT-${dateStr}-${randomNum}`
}

function validateLocation(location) {
  if (!location) return null

  const { lat, lng, address } = location

  // Validate latitude and longitude
  if (typeof lat !== "number" || typeof lng !== "number") {
    return null
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }

  return {
    lat: Number.parseFloat(lat.toFixed(6)), // Limit precision
    lng: Number.parseFloat(lng.toFixed(6)),
    address: address || null,
  }
}

// Enhanced report creation endpoint
router.post("/", upload.single("media"), async (req, res) => {
  try {
    const { description, contactInfo, anonymous, useLocation, location } = req.body

    // Enhanced validation
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: "Description is required",
        details: "Please provide a description of the issue",
      })
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        error: "Description too short",
        details: "Please provide at least 10 characters describing the issue",
      })
    }

    if (description.trim().length > 2000) {
      return res.status(400).json({
        error: "Description too long",
        details: "Please limit your description to 2000 characters",
      })
    }

    // Validate contact info if provided
    if (contactInfo && contactInfo.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contactInfo.trim())) {
        return res.status(400).json({
          error: "Invalid email format",
          details: "Please provide a valid email address",
        })
      }
    }

    // Parse and validate location
    let parsedLocation = null
    if (useLocation === "true" && location) {
      try {
        const locationData = typeof location === "string" ? JSON.parse(location) : location
        parsedLocation = validateLocation(locationData)

        if (!parsedLocation) {
          return res.status(400).json({
            error: "Invalid location data",
            details: "Please provide valid latitude and longitude coordinates",
          })
        }
      } catch (e) {
        console.warn("Failed to parse location:", location)
        return res.status(400).json({
          error: "Invalid location format",
          details: "Location data could not be processed",
        })
      }
    }

    // Generate IDs
    const trackingId = generateTrackingId()

    // Create enhanced report object
    const reportData = {
      trackingId,
      description: description.trim(),
      contactInfo: (contactInfo && contactInfo.trim()) || null,
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
      priority: "medium", // Default priority
      createdBy: anonymous === "true" ? "anonymous" : contactInfo || "unknown",
      assignedTo: null,
      category: "other",
      aiAnalysis: null,
      updates: [],
    }

    // Save to database if MongoDB is connected, otherwise use fallback
    let savedReport
    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected
      const report = new Report(reportData)
      savedReport = await report.save()
      console.log(`[CivicSense] Enhanced report saved to database: ${trackingId}`)
    } else {
      // Fallback to in-memory (this shouldn't happen if backend server is properly configured)
      const reportId = Date.now().toString()
      savedReport = {
        _id: reportId,
        id: reportId,
        ...reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Store in global reports if available
      if (global.reports) {
        global.reports.push(savedReport)
      }
      
      console.log(`[CivicSense] Enhanced report created in-memory: ${trackingId}`)
    }

    if (parsedLocation) {
      console.log(`[CivicSense] Location: ${parsedLocation.lat}, ${parsedLocation.lng}`)
    }
    if (req.file) {
      console.log(`[CivicSense] Media attached: ${req.file.filename}`)
    }

    // Return enhanced response
    res.status(201).json({
      success: true,
      trackingId,
      id: savedReport._id || savedReport.id,
      message: "Report submitted successfully",
      report: {
        trackingId: savedReport.trackingId,
        title: `Issue Report #${savedReport.trackingId.split("-").pop()}`,
        status: savedReport.status,
        createdAt: savedReport.createdAt,
        hasLocation: !!parsedLocation,
        hasMedia: !!req.file,
      },
    })
  } catch (error) {
    console.error("Create report error:", error)
    res.status(500).json({
      error: "Failed to create report",
      details: "An internal server error occurred",
    })
  }
})

export default router
