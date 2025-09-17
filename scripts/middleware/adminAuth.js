import jwt from "jsonwebtoken"

// Enhanced JWT secret management with validation
const JWT_SECRET = process.env.JWT_SECRET || "civicsense-admin-secret-key"

// Log JWT secret status for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`[CivicSense Middleware] JWT Secret: ${JWT_SECRET.substring(0, 10)}...${JWT_SECRET.length > 20 ? JWT_SECRET.substring(JWT_SECRET.length - 10) : ''} (length: ${JWT_SECRET.length})`)
}

// Validate JWT secret
if (JWT_SECRET.length < 16) {
  console.warn('[CivicSense] WARNING: JWT secret is too short. Consider using a stronger secret in production.')
}

// Global admin storage - will be shared across modules
if (!global.admins) {
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
    },
    {
      id: "2",
      username: "moderator",
      email: "moderator@civicsense.local",
      password: "$2a$10$snXtGl/N1EN/JVZEPxC/5OHO8zAKiI.YL8H08/vEfsaF5HG.5gBti", // 'mod123' hashed
      role: "moderator",
      permissions: ["view-reports", "assign-reports", "update-status"],
      profile: {
        firstName: "Report",
        lastName: "Moderator",
        position: "Report Moderator",
      },
      isActive: true,
      guestToken: null,
      createdAt: new Date().toISOString(),
    },
  ]
}

const admins = global.admins

// Middleware to authenticate admin requests
export function authenticateAdmin(req, res, next) {
  try {
    let token = req.headers.authorization
    
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7) // Remove 'Bearer ' prefix
    } else if (token && token.toLowerCase().startsWith('bearer ')) {
      token = token.substring(7) // Handle lowercase bearer
    }

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." })
    }

    // Check if it's a guest token first
    const guestAdmin = admins.find(
      (a) =>
        a.guestToken &&
        a.guestToken.token === token &&
        a.guestToken.isActive &&
        new Date(a.guestToken.expiresAt) > new Date(),
    )
    
    if (guestAdmin) {
      req.admin = {
        id: guestAdmin.id,
        username: guestAdmin.username,
        role: guestAdmin.role,
        permissions: guestAdmin.permissions,
      }
      return next()
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = admins.find((a) => a.id === decoded.id && a.isActive)

    if (!admin) {
      return res.status(401).json({ error: "Invalid token" })
    }

    // Add admin info to request
    req.admin = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
    }

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }

    console.error("Admin authentication error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
}

// Middleware to check specific permissions
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: "Authentication required" })
    }

    // Super admin has all permissions
    if (req.admin.role === "super-admin") {
      return next()
    }

    // Check if admin has the required permission
    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        error: `Access denied. Required permission: ${permission}`,
      })
    }

    next()
  }
}

// Middleware to check admin role
export function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      })
    }

    next()
  }
}

// Helper function to update guest token in admins array
export function updateGuestToken(token, expiresAt) {
  const guestAdmin = admins.find((a) => a.id === "guest")
  if (guestAdmin) {
    guestAdmin.guestToken = { token, expiresAt, isActive: true }
    console.log(`[Debug] Updated existing guest token: ${token.substring(0, 8)}...`)
  } else {
    const newGuestAdmin = {
      id: "guest",
      username: "guest",
      role: "guest",
      permissions: ["view-reports", "assign-reports", "update-status"],
      isActive: true,
      guestToken: { token, expiresAt, isActive: true },
    }
    admins.push(newGuestAdmin)
    console.log(`[Debug] Created new guest admin with token: ${token.substring(0, 8)}...`)
  }
}
