const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["super-admin", "admin", "moderator", "guest"],
    default: "admin",
  },
  permissions: [
    {
      type: String,
      enum: [
        "view-reports",
        "assign-reports",
        "update-status",
        "manage-teams",
        "manage-users",
        "view-analytics",
        "export-data",
        "system-settings",
      ],
    },
  ],
  department: {
    type: String,
    enum: [
      "public-works",
      "utilities",
      "parks-recreation",
      "transportation",
      "emergency-services",
      "environmental",
      "administration",
    ],
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    position: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  guestToken: {
    token: String,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes
adminSchema.index({ username: 1 })
adminSchema.index({ email: 1 })
adminSchema.index({ role: 1 })
adminSchema.index({ isActive: 1 })
adminSchema.index({ "guestToken.token": 1 })

// Virtual for account locked status
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Update the updatedAt field before saving
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.isLocked) {
    throw new Error("Account is temporarily locked")
  }

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)

    if (isMatch) {
      // Reset login attempts on successful login
      if (this.loginAttempts > 0) {
        this.loginAttempts = 0
        this.lockUntil = undefined
        await this.save()
      }
      this.lastLogin = new Date()
      await this.save()
      return true
    } else {
      // Increment login attempts
      this.loginAttempts += 1

      // Lock account after 5 failed attempts for 30 minutes
      if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 30 * 60 * 1000 // 30 minutes
      }

      await this.save()
      return false
    }
  } catch (error) {
    throw error
  }
}

// Method to generate guest token
adminSchema.methods.generateGuestToken = function () {
  const token = require("crypto").randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  this.guestToken = {
    token,
    expiresAt,
    isActive: true,
  }

  return this.save().then(() => token)
}

// Method to validate guest token
adminSchema.methods.validateGuestToken = function (token) {
  return this.guestToken.token === token && this.guestToken.isActive && this.guestToken.expiresAt > new Date()
}

// Method to revoke guest token
adminSchema.methods.revokeGuestToken = function () {
  this.guestToken.isActive = false
  return this.save()
}

// Method to check permissions
adminSchema.methods.hasPermission = function (permission) {
  if (this.role === "super-admin") return true
  return this.permissions.includes(permission)
}

// Static method to create default admin
adminSchema.statics.createDefaultAdmin = async function () {
  const existingAdmin = await this.findOne({ role: "super-admin" })
  if (existingAdmin) return existingAdmin

  const defaultAdmin = new this({
    username: "admin",
    email: "admin@civiccare.local",
    password: "admin123", // Will be hashed by pre-save middleware
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
  })

  return defaultAdmin.save()
}

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin
