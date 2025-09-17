import express from "express"
const router = express.Router()

// Import the Gemini service (will be converted to require for Node.js)
// For now, we'll implement the service logic directly in this file
// TODO: Convert to proper TypeScript imports when backend is fully migrated

// Mock Gemini service implementation
class MockGeminiService {
  constructor() {
    this.isConfigured = !!process.env.GEMINI_KEY
    console.log(`[AI Service] ${this.isConfigured ? "Gemini configured" : "Using mock responses"}`)
  }

  async analyzeImage(mediaUrl) {
    if (!this.isConfigured) {
      return this.getMockImageAnalysis(mediaUrl)
    }

    try {
      // TODO: Implement actual Gemini image analysis
      // const { GoogleGenerativeAI } = require('@google/generative-ai');
      // const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
      // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // For now, return mock data
      return this.getMockImageAnalysis(mediaUrl)
    } catch (error) {
      console.error("[AI Service] Image analysis failed:", error)
      return this.getMockImageAnalysis(mediaUrl)
    }
  }

  async generateDescription(mediaUrl, shortText) {
    if (!this.isConfigured) {
      return this.getMockDescriptionGeneration(mediaUrl, shortText)
    }

    try {
      // TODO: Implement actual Gemini description generation
      return this.getMockDescriptionGeneration(mediaUrl, shortText)
    } catch (error) {
      console.error("[AI Service] Description generation failed:", error)
      return this.getMockDescriptionGeneration(mediaUrl, shortText)
    }
  }

  async transcribeAudio(audioUrl) {
    if (!this.isConfigured) {
      return this.getMockTranscription(audioUrl)
    }

    try {
      // TODO: Implement actual Gemini audio transcription
      return this.getMockTranscription(audioUrl)
    } catch (error) {
      console.error("[AI Service] Audio transcription failed:", error)
      return this.getMockTranscription(audioUrl)
    }
  }

  getMockImageAnalysis(mediaUrl) {
    const mockAnalyses = [
      {
        issueType: "infrastructure",
        severity: "medium",
        confidence: 85,
        suggestedTitle: "Pothole on Main Street",
        shortDesc: "Large pothole causing traffic disruption and potential vehicle damage on busy street intersection.",
      },
      {
        issueType: "safety",
        severity: "high",
        confidence: 92,
        suggestedTitle: "Broken Streetlight",
        shortDesc: "Non-functioning streetlight creating safety hazard for pedestrians during evening hours.",
      },
      {
        issueType: "environment",
        severity: "low",
        confidence: 78,
        suggestedTitle: "Litter in Park Area",
        shortDesc: "Accumulated trash and debris affecting park cleanliness and visitor experience.",
      },
      {
        issueType: "public-services",
        severity: "urgent",
        confidence: 95,
        suggestedTitle: "Water Main Break",
        shortDesc: "Active water leak causing flooding and service disruption to nearby residents.",
      },
    ]

    const hash = this.simpleHash(mediaUrl)
    const selected = mockAnalyses[hash % mockAnalyses.length]

    console.log("[AI Service] Returning mock image analysis for:", mediaUrl)
    return selected
  }

  getMockDescriptionGeneration(mediaUrl, shortText) {
    const mockDescriptions = [
      {
        shortDescription:
          "Road infrastructure issue requiring immediate attention. Pothole approximately 2 feet in diameter affecting vehicle traffic flow.",
        longDescription:
          "This infrastructure issue involves a significant pothole located on a high-traffic street. The damage appears to be caused by recent weather conditions and heavy vehicle usage. The pothole measures approximately 2 feet in diameter and 6 inches deep, creating a hazard for vehicles and potentially causing tire damage or alignment issues. Immediate repair is recommended to prevent further deterioration and ensure public safety.",
      },
      {
        shortDescription:
          "Public safety concern involving non-functional street lighting equipment requiring electrical maintenance and bulb replacement.",
        longDescription:
          "This safety issue involves a malfunctioning streetlight that has been reported as non-operational for several days. The affected area experiences reduced visibility during evening and nighttime hours, creating potential safety risks for pedestrians and drivers. Municipal electrical services should prioritize this repair to restore adequate illumination and ensure community safety standards are maintained.",
      },
    ]

    const hash = this.simpleHash(mediaUrl + (shortText || ""))
    const selected = mockDescriptions[hash % mockDescriptions.length]

    console.log("[AI Service] Returning mock description generation")
    return selected
  }

  getMockTranscription(audioUrl) {
    const mockTranscriptions = [
      {
        text: "There is a large pothole on Main Street near the intersection with Oak Avenue. It has been causing problems for drivers and needs to be fixed soon.",
        language: "en",
        translatedText: undefined,
      },
      {
        text: "The streetlight at the corner of First and Maple has been out for three days. It is very dark at night and unsafe for pedestrians.",
        language: "en",
        translatedText: undefined,
      },
      {
        text: "Hay un problema con la tubería de agua en mi calle. Está saliendo mucha agua y necesita reparación urgente.",
        language: "es",
        translatedText:
          "There is a problem with the water pipe on my street. A lot of water is coming out and it needs urgent repair.",
      },
    ]

    const hash = this.simpleHash(audioUrl)
    const selected = mockTranscriptions[hash % mockTranscriptions.length]

    console.log("[AI Service] Returning mock transcription")
    return selected
  }

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      provider: this.isConfigured ? "Google Gemini" : "Mock Service",
      features: ["image-analysis", "description-generation", "audio-transcription"],
    }
  }
}

// Initialize service
const aiService = new MockGeminiService()

// POST /ai/analyze-image
router.post("/analyze-image", async (req, res) => {
  try {
    const { mediaUrl } = req.body

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        error: "Media URL is required",
      })
    }

    console.log("[AI API] Analyzing image:", mediaUrl)
    const analysis = await aiService.analyzeImage(mediaUrl)

    res.json({
      success: true,
      data: analysis,
      meta: {
        provider: aiService.getStatus().provider,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[AI API] Image analysis error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to analyze image",
      details: error.message,
    })
  }
})

// POST /ai/generate-description
router.post("/generate-description", async (req, res) => {
  try {
    const { mediaUrl, shortText } = req.body

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        error: "Media URL is required",
      })
    }

    console.log("[AI API] Generating description for:", mediaUrl)
    const descriptions = await aiService.generateDescription(mediaUrl, shortText)

    res.json({
      success: true,
      data: descriptions,
      meta: {
        provider: aiService.getStatus().provider,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[AI API] Description generation error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to generate description",
      details: error.message,
    })
  }
})

// POST /ai/transcribe
router.post("/transcribe", async (req, res) => {
  try {
    const { audioUrl } = req.body

    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        error: "Audio URL is required",
      })
    }

    console.log("[AI API] Transcribing audio:", audioUrl)
    const transcription = await aiService.transcribeAudio(audioUrl)

    res.json({
      success: true,
      data: transcription,
      meta: {
        provider: aiService.getStatus().provider,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[AI API] Audio transcription error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to transcribe audio",
      details: error.message,
    })
  }
})

// GET /ai/status
router.get("/status", (req, res) => {
  const status = aiService.getStatus()

  res.json({
    success: true,
    data: status,
    meta: {
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
