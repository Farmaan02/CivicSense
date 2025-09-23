// Simple test helper file to create an express app for testing
import cors from "cors"
import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"

// Simple mock paths for testing
const __filename = './test-app.js';
const __dirname = '.';

// Create a test app with the same configuration as the main app
const app = express()

console.log("Test app created");

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Add debugging middleware to see what's happening
app.use((req, res, next) => {
  console.log(`Middleware: ${req.method} ${req.url}`);
  next();
});

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

// Health check
app.get("/health", async (req, res) => {
  console.log("Health check route called");
  try {
    const reportsCount = global.reports.length
    
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      reportsCount,
      databaseMode: "In-Memory",
    })
  } catch (error) {
    console.error("Health check error:", error)
    res.status(500).json({ error: "Health check failed" })
  }
})

// Get reports endpoint with filtering
app.get("/reports", async (req, res) => {
  try {
    console.log("GET /reports route called");
    console.log("GET /reports called with query:", req.query);
    // Get query parameters for filtering
    const { format, status, severity, limit } = req.query

    // Filter reports based on query parameters
    let filteredReports = global.reports
    
    // Filter by status if provided
    if (status) {
      filteredReports = global.reports.filter(report => report.status === status)
    }

    // Filter by severity if provided
    if (severity) {
      filteredReports = filteredReports.filter(report => report.priority === severity)
    }

    // Only include reports with location for map view
    if (format === "map") {
      filteredReports = filteredReports.filter(
        report => report.location && report.location.lat && report.location.lng
      )
    }

    // Limit results if specified
    if (limit) {
      const limitNum = Number.parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredReports = filteredReports.slice(0, limitNum)
      }
    }

    // Return reports from in-memory database
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
      location: report.location || null,
    }))

    res.json(publicReports)
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Failed to fetch reports" })
  }
})

// Create report endpoint - using multer middleware to parse form data
app.post("/reports", upload.single("media"), async (req, res) => {
  try {
    console.log("POST /reports route called");
    console.log("Received request body:", req.body);
    const { description, contactInfo, anonymous, useLocation, location } = req.body

    // Validate required fields
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description is required" })
    }

    // Generate tracking ID
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")
    const trackingId = `RPT-${dateStr}-${randomNum}`

    // Parse location if provided
    let parsedLocation = null
    if (useLocation === "true" && location) {
      try {
        parsedLocation = JSON.parse(location)
      } catch (e) {
        console.error("Location parse error:", e)
      }
    }

    // Create report object
    const report = {
      id: (global.reports.length + 1).toString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store in-memory
    global.reports.push(report)

    // Return response
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

// Simple mock routes for testing
app.post("/media/upload", upload.single("media"), (req, res) => {
  try {
    console.log("Media upload request received");
    console.log("File:", req.file);
    console.log("Body:", req.body);
    
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" })
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    
    console.log("File uploaded successfully:", req.file.filename);

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    })
  } catch (error) {
    console.error("Media upload error:", error)
    res.status(500).json({ error: "Failed to upload media" })
  }
})

// Auth routes
// Admin login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    // Find admin by username or email
    const admin = global.admins.find((a) => (a.username === username || a.email === username) && a.isActive)

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // For testing, we'll just check if the password matches our mock hash
    // In real implementation, we would use bcrypt.compare
    const isValidPassword = password === "admin123"
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Update last login
    admin.lastLogin = new Date().toISOString()

    // Generate JWT token
    const token = generateToken(admin)

    // Return admin info and token
    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        profile: admin.profile,
        lastLogin: admin.lastLogin,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Guest token endpoint
app.post("/auth/guest", (req, res) => {
  try {
    const { password } = req.body

    // Simple guest password check (MVP only)
    const guestPassword = process.env.GUEST_PASSWORD || "guest123"

    if (password !== guestPassword) {
      return res.status(401).json({ error: "Invalid guest password" })
    }

    // Generate guest token
    const { token, expiresAt } = generateGuestToken()

    // Update the shared global admin storage
    updateGuestToken(token, expiresAt)

    // Create guest admin for response
    const guestAdmin = global.admins.find(a => a.id === "guest") || {
      id: "guest",
      username: "guest",
      role: "guest",
      permissions: ["view-reports", "assign-reports", "update-status"],
    }

    res.json({
      token,
      expiresAt,
      admin: {
        id: guestAdmin.id,
        username: guestAdmin.username,
        role: guestAdmin.role,
        permissions: guestAdmin.permissions,
        profile: {
          firstName: "Guest",
          lastName: "Admin",
          position: "Guest Administrator",
        },
      },
    })
  } catch (error) {
    console.error("Guest token error:", error)
    res.status(500).json({ error: "Failed to generate guest token" })
  }
})

// Verify token endpoint
app.get("/auth/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    // Check if it's a guest token
    const guestAdmin = global.admins.find(
      (a) =>
        a.guestToken &&
        a.guestToken.token === token &&
        a.guestToken.isActive &&
        new Date(a.guestToken.expiresAt) > new Date(),
    )

    if (guestAdmin) {
      return res.json({
        valid: true,
        admin: {
          id: guestAdmin.id,
          username: guestAdmin.username,
          role: guestAdmin.role,
          permissions: guestAdmin.permissions,
          profile: guestAdmin.profile || {
            firstName: "Guest",
            lastName: "Admin",
            position: "Guest Administrator",
          },
        },
      })
    }

    // For testing, we'll just check if the token starts with "mock-jwt-token"
    if (token.startsWith("mock-jwt-token")) {
      const admin = global.admins.find((a) => a.isActive)
      if (admin) {
        return res.json({
          valid: true,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            profile: admin.profile,
          },
        })
      }
    }

    return res.status(401).json({ error: "Invalid token" })
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(500).json({ error: "Token verification failed" })
  }
})

// Get current admin info
app.get("/auth/me", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    // Check guest token first
    const guestAdmin = global.admins.find(
      (a) =>
        a.guestToken &&
        a.guestToken.token === token &&
        a.guestToken.isActive &&
        new Date(a.guestToken.expiresAt) > new Date(),
    )

    if (guestAdmin) {
      return res.json({
        id: guestAdmin.id,
        username: guestAdmin.username,
        role: guestAdmin.role,
        permissions: guestAdmin.permissions,
        profile: guestAdmin.profile || {
          firstName: "Guest",
          lastName: "Admin",
          position: "Guest Administrator",
        },
      })
    }

    // For testing, we'll just check if the token starts with "mock-jwt-token"
    if (token.startsWith("mock-jwt-token")) {
      const admin = global.admins.find((a) => a.isActive)
      if (admin) {
        return res.json({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          profile: admin.profile,
          lastLogin: admin.lastLogin,
        })
      }
    }

    return res.status(401).json({ error: "Invalid or expired token" })
  } catch (error) {
    console.error("Get admin info error:", error)
    res.status(500).json({ error: "Failed to get admin info" })
  }
})

console.log("All routes registered");

// Error handling middleware for multer errors - MUST have 4 parameters
// This should be placed AFTER all routes
app.use((error, req, res, next) => {
  console.log("Error caught in middleware:", error);
  console.log("Error type:", error.constructor.name);
  console.log("Error code:", error.code);
  console.log("Error message:", error.message);
  
  if (error instanceof multer.MulterError) {
    console.log("Handling MulterError");
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." })
    }
  }
  // Handle file filter errors
  if (error.message && error.message.includes("Only image and video files are allowed")) {
    console.log("Handling file filter error");
    return res.status(400).json({ error: error.message })
  }
  console.log("Passing error to next handler");
  next(error)
})

// 404 handler - MUST be the last middleware
app.use((req, res) => {
  console.log("404 handler called for:", req.method, req.url);
  res.status(404).json({ error: "Endpoint not found" })
})

// Set test environment
process.env.NODE_ENV = 'test'

// Initialize simple in-memory database
global.reports = [
  {
    id: "1",
    trackingId: "RPT-20241215-0001",
    description: "Test report for testing",
    status: "reported",
    anonymous: false,
    contactInfo: "test@example.com",
    location: { lat: 40.7128, lng: -74.006, address: "Test Street" },
    priority: "medium",
    category: "infrastructure",
    createdBy: "test@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

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

// Helper function to generate JWT token (mock)
function generateToken(admin) {
  // Simple mock token generation
  return `mock-jwt-token-for-${admin.username}-${Date.now()}`
}

// Helper function to generate guest token (mock)
function generateGuestToken() {
  const token = `mock-guest-token-${Date.now()}`
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  return { token, expiresAt }
}

// Helper function to update guest token (mock)
function updateGuestToken(token, expiresAt) {
  const guestAdmin = global.admins.find(a => a.id === "guest")
  if (guestAdmin) {
    guestAdmin.guestToken = { token, expiresAt, isActive: true }
  } else {
    global.admins.push({
      id: "guest",
      username: "guest",
      role: "guest",
      permissions: ["view-reports", "assign-reports", "update-status"],
      profile: {
        firstName: "Guest",
        lastName: "Admin",
        position: "Guest Administrator",
      },
      isActive: true,
      guestToken: { token, expiresAt, isActive: true },
      createdAt: new Date().toISOString(),
    })
  }
}

// Export the app for testing
export { app }