import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { updateGuestToken } from "../middleware/adminAuth.js"

const router = express.Router()

// Use global admin storage to sync with adminAuth middleware
const admins = global.admins

// JWT secret (use environment variable in production)
// Enhanced secret management with validation
const JWT_SECRET = process.env.JWT_SECRET || "civicpulse-admin-secret-key"

// Log JWT secret status for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`[CivicPulse Auth] JWT Secret: ${JWT_SECRET.substring(0, 10)}...${JWT_SECRET.length > 20 ? JWT_SECRET.substring(JWT_SECRET.length - 10) : ''} (length: ${JWT_SECRET.length})`)
}

// Helper function to generate JWT token
function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

// Helper function to generate guest token
function generateGuestToken() {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  return { token, expiresAt }
}

// Admin login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    // Find admin by username or email
    const admin = admins.find((a) => (a.username === username || a.email === username) && a.isActive)

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, admin.password)
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

    console.log(`[v0] Admin login successful: ${admin.username}`)
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Guest token endpoint (for MVP)
router.post("/guest", (req, res) => {
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
    const guestAdmin = {
      id: "guest",
      username: "guest",
      role: "guest",
      permissions: ["view-reports", "assign-reports", "update-status"],
    }

    // Add or update guest admin (this is now handled by updateGuestToken)
    // No need to manually manage the admins array here

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

    console.log(`[v0] Guest token generated: ${token.substring(0, 8)}...`)
  } catch (error) {
    console.error("Guest token error:", error)
    res.status(500).json({ error: "Failed to generate guest token" })
  }
})

// Verify token endpoint
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    // Check if it's a guest token
    const guestAdmin = admins.find(
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

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = admins.find((a) => a.id === decoded.id && a.isActive)

    if (!admin) {
      return res.status(401).json({ error: "Invalid token" })
    }

    res.json({
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
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }

    console.error("Token verification error:", error)
    res.status(500).json({ error: "Token verification failed" })
  }
})

// Logout endpoint (revoke guest token)
router.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(400).json({ error: "No token provided" })
    }

    // Find and revoke guest token
    const guestAdmin = admins.find((a) => a.guestToken && a.guestToken.token === token)

    if (guestAdmin) {
      guestAdmin.guestToken.isActive = false
      console.log(`[v0] Guest token revoked: ${token.substring(0, 8)}...`)
    }

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Logout failed" })
  }
})

// Get current admin info
router.get("/me", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    // Check guest token first
    const guestAdmin = admins.find(
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

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = admins.find((a) => a.id === decoded.id && a.isActive)

    if (!admin) {
      return res.status(401).json({ error: "Invalid token" })
    }

    res.json({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      profile: admin.profile,
      lastLogin: admin.lastLogin,
    })
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    console.error("Get admin info error:", error)
    res.status(500).json({ error: "Failed to get admin info" })
  }
})

export default router
