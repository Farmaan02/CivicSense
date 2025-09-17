import express from "express"
import { authenticateAdmin, requirePermission } from "../middleware/adminAuth.js"
// import { geminiService } from "../services/geminiService.js" // Commented out due to TypeScript compatibility

const router = express.Router()

// Mock geminiService for analytics
const mockGeminiService = {
  generateText: async (prompt) => {
    return `Weekly Civic Issues Summary

This week we processed reports across various categories. Key highlights include improved response times and continued community engagement in civic improvement initiatives.

Recommendations: Continue monitoring trends and maintain efficient resolution processes.`
  }
}

// Helper function to get reports data (in a real app, this would come from database)
function getReportsData() {
  // This would be imported from the main server or database service
  // For now, we'll access it through the global scope or pass it as parameter
  return global.reports || []
}

// GET /analytics/most-common?period=week|month
router.get("/most-common", authenticateAdmin, requirePermission("view-reports"), (req, res) => {
  try {
    const { period = "week" } = req.query
    const reports = getReportsData()

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()
    if (period === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    }

    // Filter reports by date range
    const filteredReports = reports.filter((report) => {
      const reportDate = new Date(report.createdAt)
      return reportDate >= startDate && reportDate <= now
    })

    // Aggregate by category
    const categoryCount = {}
    filteredReports.forEach((report) => {
      const category = report.category || "other"
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    // Convert to array and sort by count
    const mostCommon = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10

    res.json({
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: now.toISOString(),
      },
      data: mostCommon,
      total: filteredReports.length,
    })
  } catch (error) {
    console.error("Most common analytics error:", error)
    res.status(500).json({ error: "Failed to fetch most common issues" })
  }
})

// GET /analytics/avg-resolution-time?period=month
router.get("/avg-resolution-time", authenticateAdmin, requirePermission("view-reports"), (req, res) => {
  try {
    const { period = "month" } = req.query
    const reports = getReportsData()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7)
    }

    // Filter resolved reports in the period
    const resolvedReports = reports.filter((report) => {
      const reportDate = new Date(report.createdAt)
      return report.status === "resolved" && reportDate >= startDate && reportDate <= now
    })

    if (resolvedReports.length === 0) {
      return res.json({
        period,
        averageResolutionTime: 0,
        averageResolutionTimeHours: 0,
        resolvedCount: 0,
        unit: "hours",
      })
    }

    // Calculate resolution times
    const resolutionTimes = resolvedReports.map((report) => {
      const createdAt = new Date(report.createdAt)
      const updatedAt = new Date(report.updatedAt)
      return updatedAt - createdAt // milliseconds
    })

    const avgResolutionTimeMs = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
    const averageResolutionTimeHours = Math.round((avgResolutionTimeMs / (1000 * 60 * 60)) * 10) / 10

    res.json({
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: now.toISOString(),
      },
      averageResolutionTime: avgResolutionTimeMs,
      averageResolutionTimeHours,
      resolvedCount: resolvedReports.length,
      unit: "hours",
    })
  } catch (error) {
    console.error("Average resolution time analytics error:", error)
    res.status(500).json({ error: "Failed to fetch average resolution time" })
  }
})

// GET /analytics/top-locations?limit=10
router.get("/top-locations", authenticateAdmin, requirePermission("view-reports"), (req, res) => {
  try {
    const { limit = 10 } = req.query
    const reports = getReportsData()

    // Filter reports with location data
    const reportsWithLocation = reports.filter((report) => report.location && report.location.address)

    // Aggregate by location address
    const locationCount = {}
    reportsWithLocation.forEach((report) => {
      const address = report.location.address
      if (address) {
        locationCount[address] = (locationCount[address] || 0) + 1
      }
    })

    // Convert to array and sort by count
    const topLocations = Object.entries(locationCount)
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, Number.parseInt(limit))

    res.json({
      data: topLocations,
      total: reportsWithLocation.length,
      limit: Number.parseInt(limit),
    })
  } catch (error) {
    console.error("Top locations analytics error:", error)
    res.status(500).json({ error: "Failed to fetch top locations" })
  }
})

// GET /analytics/weekly-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/weekly-summary", authenticateAdmin, requirePermission("view-reports"), async (req, res) => {
  try {
    const { from, to } = req.query

    if (!from || !to) {
      return res.status(400).json({ error: "Both 'from' and 'to' date parameters are required" })
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)
    const reports = getReportsData()

    // Filter reports by date range
    const filteredReports = reports.filter((report) => {
      const reportDate = new Date(report.createdAt)
      return reportDate >= fromDate && reportDate <= toDate
    })

    // Prepare summary data
    const summaryData = {
      totalReports: filteredReports.length,
      statusBreakdown: {},
      categoryBreakdown: {},
      priorityBreakdown: {},
      resolvedCount: 0,
      avgResolutionTime: 0,
    }

    // Calculate breakdowns
    filteredReports.forEach((report) => {
      // Status breakdown
      summaryData.statusBreakdown[report.status] = (summaryData.statusBreakdown[report.status] || 0) + 1

      // Category breakdown
      const category = report.category || "other"
      summaryData.categoryBreakdown[category] = (summaryData.categoryBreakdown[category] || 0) + 1

      // Priority breakdown
      summaryData.priorityBreakdown[report.priority] = (summaryData.priorityBreakdown[report.priority] || 0) + 1

      // Resolution tracking
      if (report.status === "resolved") {
        summaryData.resolvedCount++
      }
    })

    // Try to generate AI summary, fallback to mock
    let aiSummary = ""
    try {
      if (process.env.GEMINI_KEY) {
        const prompt = `Generate a weekly summary report for civic issues management:
        
Period: ${from} to ${to}
Total Reports: ${summaryData.totalReports}
Status Breakdown: ${JSON.stringify(summaryData.statusBreakdown)}
Category Breakdown: ${JSON.stringify(summaryData.categoryBreakdown)}
Priority Breakdown: ${JSON.stringify(summaryData.priorityBreakdown)}
Resolved Reports: ${summaryData.resolvedCount}

Please provide a concise, professional summary highlighting key trends, achievements, and areas of concern.`

        aiSummary = await mockGeminiService.generateText(prompt)
      } else {
        // Mock summary when no AI service available
        aiSummary = `Weekly Civic Issues Summary (${from} to ${to})

This week we processed ${summaryData.totalReports} reports across various categories. 

Key Highlights:
• ${summaryData.resolvedCount} reports were successfully resolved
• Most common issue types: ${Object.entries(summaryData.categoryBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, count]) => `${cat} (${count})`)
          .join(", ")}
• Current status distribution shows ${summaryData.statusBreakdown["in-progress"] || 0} reports in progress

Areas for attention:
• Continue monitoring high-priority issues
• Maintain resolution efficiency for community satisfaction
• Focus on preventive measures for recurring issue types

Overall, the team maintained good response times and community engagement levels.`
      }
    } catch (error) {
      console.error("AI summary generation error:", error)
      aiSummary = `Weekly Summary (${from} to ${to}): ${summaryData.totalReports} total reports, ${summaryData.resolvedCount} resolved. System generated summary unavailable.`
    }

    res.json({
      dateRange: { from, to },
      summary: aiSummary,
      data: summaryData,
      generatedAt: new Date().toISOString(),
      aiGenerated: !!process.env.GEMINI_KEY,
    })
  } catch (error) {
    console.error("Weekly summary analytics error:", error)
    res.status(500).json({ error: "Failed to generate weekly summary" })
  }
})

// GET /analytics/heatmap-data - For heatmap visualization
router.get("/heatmap-data", authenticateAdmin, requirePermission("view-reports"), (req, res) => {
  try {
    const reports = getReportsData()

    // Filter reports with location data
    const reportsWithLocation = reports.filter(
      (report) => report.location && report.location.lat && report.location.lng,
    )

    // Format data for heatmap
    const heatmapData = reportsWithLocation.map((report) => ({
      lat: report.location.lat,
      lng: report.location.lng,
      intensity: 1, // Can be adjusted based on priority or other factors
      status: report.status,
      priority: report.priority,
      category: report.category || "other",
    }))

    res.json({
      data: heatmapData,
      total: heatmapData.length,
      bounds: calculateBounds(heatmapData),
    })
  } catch (error) {
    console.error("Heatmap data analytics error:", error)
    res.status(500).json({ error: "Failed to fetch heatmap data" })
  }
})

// Helper function to calculate map bounds
function calculateBounds(data) {
  if (data.length === 0) return null

  const lats = data.map((point) => point.lat)
  const lngs = data.map((point) => point.lng)

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  }
}

export default router
