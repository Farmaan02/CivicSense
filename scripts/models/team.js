const mongoose = require("mongoose")

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  department: {
    type: String,
    required: true,
    enum: [
      "public-works",
      "utilities",
      "parks-recreation",
      "transportation",
      "emergency-services",
      "environmental",
      "other",
    ],
  },
  members: [
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["lead", "member", "specialist"],
        default: "member",
      },
    },
  ],
  specialties: [
    {
      type: String,
      enum: ["infrastructure", "safety", "environment", "public-services", "emergency", "maintenance"],
    },
  ],
  capacity: {
    type: Number,
    default: 5,
    min: 1,
    max: 50,
  },
  currentLoad: {
    type: Number,
    default: 0,
    min: 0,
  },
  assignedReports: [
    {
      reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  contactInfo: {
    phone: String,
    email: String,
    location: String,
  },
  workingHours: {
    start: {
      type: String,
      default: "08:00",
    },
    end: {
      type: String,
      default: "17:00",
    },
    days: [
      {
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      },
    ],
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

// Indexes for efficient queries
teamSchema.index({ department: 1 })
teamSchema.index({ specialties: 1 })
teamSchema.index({ isActive: 1 })
teamSchema.index({ currentLoad: 1, capacity: 1 })

// Update the updatedAt field before saving
teamSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Virtual for available capacity
teamSchema.virtual("availableCapacity").get(function () {
  return this.capacity - this.currentLoad
})

// Method to check if team can take more assignments
teamSchema.methods.canTakeAssignment = function () {
  return this.isActive && this.currentLoad < this.capacity
}

// Method to assign a report
teamSchema.methods.assignReport = function (reportId, priority = "medium") {
  if (!this.canTakeAssignment()) {
    throw new Error("Team is at full capacity")
  }

  this.assignedReports.push({
    reportId,
    priority,
    assignedAt: new Date(),
  })
  this.currentLoad += 1
  return this.save()
}

// Method to unassign a report
teamSchema.methods.unassignReport = function (reportId) {
  const reportIndex = this.assignedReports.findIndex((report) => report.reportId.toString() === reportId.toString())

  if (reportIndex > -1) {
    this.assignedReports.splice(reportIndex, 1)
    this.currentLoad = Math.max(0, this.currentLoad - 1)
    return this.save()
  }

  throw new Error("Report not found in team assignments")
}

// Static method to find available teams for a category
teamSchema.statics.findAvailableForCategory = function (category) {
  return this.find({
    isActive: true,
    $expr: { $lt: ["$currentLoad", "$capacity"] },
    specialties: category,
  }).sort({ currentLoad: 1, capacity: -1 })
}

const Team = mongoose.model("Team", teamSchema)

module.exports = Team
