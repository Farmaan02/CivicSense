import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads with enhanced validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
    cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedName}`)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Single file upload
  },
  fileFilter: (req, file, cb) => {
    // Enhanced file type validation
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"]
    const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"]

    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedAudioTypes]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Supported types: images, videos, audio files.`), false)
    }
  },
})

// Enhanced media upload endpoint
router.post("/upload", upload.single("media"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        details: "Please select a file to upload",
      })
    }

    // Generate accessible URL
    const baseUrl = `${req.protocol}://${req.get("host")}`
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`

    // Determine media type
    const mediaType = req.file.mimetype.startsWith("image/")
      ? "image"
      : req.file.mimetype.startsWith("video/")
        ? "video"
        : req.file.mimetype.startsWith("audio/")
          ? "audio"
          : "unknown"

    // Enhanced response with metadata
    const response = {
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      mediaType: mediaType,
      uploadedAt: new Date().toISOString(),
      // Add file size in human readable format
      sizeFormatted: formatFileSize(req.file.size),
    }

    console.log(`[v0] Media uploaded successfully: ${req.file.filename} (${response.sizeFormatted})`)

    res.json(response)
  } catch (error) {
    console.error("Media upload error:", error)
    res.status(500).json({
      error: "Failed to upload media",
      details: error.message,
    })
  }
})

// Get media file info endpoint
router.get("/info/:filename", (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }

    const stats = fs.statSync(filePath)
    const baseUrl = `${req.protocol}://${req.get("host")}`

    res.json({
      filename: filename,
      url: `${baseUrl}/uploads/${filename}`,
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      uploadedAt: stats.birthtime.toISOString(),
      lastModified: stats.mtime.toISOString(),
    })
  } catch (error) {
    console.error("Get media info error:", error)
    res.status(500).json({ error: "Failed to get media info" })
  }
})

// Delete media file endpoint (for cleanup)
router.delete("/:filename", (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }

    fs.unlinkSync(filePath)
    console.log(`[v0] Media file deleted: ${filename}`)

    res.json({
      success: true,
      message: "File deleted successfully",
      filename: filename,
    })
  } catch (error) {
    console.error("Delete media error:", error)
    res.status(500).json({ error: "Failed to delete media file" })
  }
})

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        details: "Maximum file size is 10MB",
      })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files",
        details: "Only one file can be uploaded at a time",
      })
    }
  }

  if (error.message.includes("not allowed")) {
    return res.status(400).json({
      error: "Invalid file type",
      details: error.message,
    })
  }

  next(error)
})

export default router
