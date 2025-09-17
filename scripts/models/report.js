// Mongoose model for Report (to be used when MongoDB is connected)
import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    contactInfo: {
      type: String,
      trim: true,
      default: null,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    useLocation: {
      type: Boolean,
      default: true,
    },
    location: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
      address: String,
    },
    media: {
      url: String,
      filename: String,
      originalName: String,
      size: Number,
      mimetype: String,
    },
    status: {
      type: String,
      enum: ["reported", "in-review", "in-progress", "resolved", "closed"],
      default: "reported",
    },
    createdBy: {
      type: String,
      default: "unknown",
    },
    assignedTo: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["infrastructure", "safety", "environment", "public-services", "other"],
      default: "other",
    },
    aiAnalysis: {
      // Core AI analysis results
      issueType: {
        type: String,
        enum: ["infrastructure", "safety", "environment", "public-services", "other"],
        default: null,
      },
      severity: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: null,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      suggestedTitle: {
        type: String,
        maxlength: 100,
        default: null,
      },
      shortDescription: {
        type: String,
        maxlength: 500,
        default: null,
      },
      longDescription: {
        type: String,
        maxlength: 1500,
        default: null,
      },

      // Audio transcription results
      transcription: {
        text: String,
        language: String,
        translatedText: String,
        confidence: Number,
      },

      // Processing metadata
      processedAt: Date,
      provider: {
        type: String,
        enum: ["gemini", "mock"],
        default: "mock",
      },
      version: {
        type: String,
        default: "1.0",
      },

      // Legacy fields for backward compatibility
      description: String, // Deprecated: use shortDescription instead
      tags: [String], // Deprecated: use issueType and category instead
    },

    aiGeneratedDescription: {
      type: String,
      maxlength: 1500,
      default: null,
    },

    updates: [
      {
        message: String,
        status: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
reportSchema.index({ createdAt: -1 })
reportSchema.index({ status: 1 })
reportSchema.index({ "location.lat": 1, "location.lng": 1 })
reportSchema.index({ category: 1 })
reportSchema.index({ "aiAnalysis.issueType": 1 })
reportSchema.index({ "aiAnalysis.severity": 1 })
reportSchema.index({ "aiAnalysis.confidence": -1 })

// Virtual for public display (excludes sensitive info for anonymous reports)
reportSchema.virtual("publicView").get(function () {
  const report = this.toObject()
  if (report.anonymous) {
    delete report.contactInfo
    report.createdBy = "anonymous"
  }
  return report
})

reportSchema.virtual("aiConfidenceDisplay").get(function () {
  if (this.aiAnalysis && this.aiAnalysis.confidence) {
    return `${Math.round(this.aiAnalysis.confidence)}%`
  }
  return null
})

reportSchema.methods.updateAIAnalysis = function (analysisData) {
  this.aiAnalysis = {
    ...this.aiAnalysis,
    ...analysisData,
    processedAt: new Date(),
    version: "1.0",
  }

  // Update main fields based on AI suggestions if they haven't been manually set
  if (analysisData.issueType && this.category === "other") {
    this.category = analysisData.issueType
  }

  if (analysisData.severity && this.priority === "medium") {
    this.priority = analysisData.severity
  }

  if (analysisData.shortDescription) {
    this.aiGeneratedDescription = analysisData.shortDescription
  }

  return this.save()
}

export const Report = mongoose.model("Report", reportSchema)
