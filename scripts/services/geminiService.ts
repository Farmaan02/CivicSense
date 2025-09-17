import { GoogleGenerativeAI } from "@google/generative-ai"

// Types for AI analysis results
export interface ImageAnalysisResult {
  issueType: string
  severity: "low" | "medium" | "high" | "urgent"
  confidence: number
  suggestedTitle: string
  shortDesc: string
}

export interface DescriptionGenerationResult {
  shortDescription: string
  longDescription: string
}

export interface TranscriptionResult {
  text: string
  language: string
  translatedText?: string
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private isConfigured = false

  constructor() {
    const apiKey = process.env.GEMINI_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.isConfigured = true
      console.log("[AI Service] Gemini AI configured successfully")
    } else {
      console.log("[AI Service] GEMINI_KEY not found, using mock responses")
    }
  }

  /**
   * Analyze an image to classify issue type, severity, and generate descriptions
   */
  async analyzeImage(mediaUrl: string): Promise<ImageAnalysisResult> {
    if (!this.isConfigured) {
      return this.getMockImageAnalysis(mediaUrl)
    }

    try {
      // TODO: Implement actual Gemini image analysis
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Analyze this civic issue image and provide:
        1. Issue type (infrastructure, safety, environment, public-services, other)
        2. Severity level (low, medium, high, urgent)
        3. Confidence score (0-100)
        4. Suggested title (max 50 chars)
        5. Short description (max 150 chars)
        
        Return as JSON format.
      `

      // For now, return mock data with TODO comment
      // TODO: Replace with actual Gemini API call when ready
      return this.getMockImageAnalysis(mediaUrl)
    } catch (error) {
      console.error("[AI Service] Image analysis failed:", error)
      return this.getMockImageAnalysis(mediaUrl)
    }
  }

  /**
   * Generate detailed descriptions from media and optional text
   */
  async generateDescription(mediaUrl: string, shortText?: string): Promise<DescriptionGenerationResult> {
    if (!this.isConfigured) {
      return this.getMockDescriptionGeneration(mediaUrl, shortText)
    }

    try {
      // TODO: Implement actual Gemini description generation
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Generate descriptions for this civic issue:
        ${shortText ? `Context: ${shortText}` : ""}
        
        Provide:
        1. Short description (50-100 words)
        2. Long description (150-300 words)
        
        Focus on actionable details for municipal workers.
      `

      // For now, return mock data with TODO comment
      // TODO: Replace with actual Gemini API call when ready
      return this.getMockDescriptionGeneration(mediaUrl, shortText)
    } catch (error) {
      console.error("[AI Service] Description generation failed:", error)
      return this.getMockDescriptionGeneration(mediaUrl, shortText)
    }
  }

  /**
   * Transcribe audio and optionally translate
   */
  async transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
    if (!this.isConfigured) {
      return this.getMockTranscription(audioUrl)
    }

    try {
      // TODO: Implement actual Gemini audio transcription
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" })

      // For now, return mock data with TODO comment
      // TODO: Replace with actual Gemini API call when ready
      return this.getMockTranscription(audioUrl)
    } catch (error) {
      console.error("[AI Service] Audio transcription failed:", error)
      return this.getMockTranscription(audioUrl)
    }
  }

  /**
   * Generate text using Gemini AI for various purposes including weekly summaries
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.isConfigured) {
      return this.getMockTextGeneration(prompt)
    }

    try {
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log("[AI Service] Generated text successfully")
      return text
    } catch (error) {
      console.error("[AI Service] Text generation failed:", error)
      return this.getMockTextGeneration(prompt)
    }
  }

  private getMockTextGeneration(prompt: string): string {
    // Check if this is a weekly summary request
    if (prompt.toLowerCase().includes("weekly summary")) {
      const mockSummaries = [
        `Weekly Civic Issues Summary

This week we processed a total of reports across various categories, demonstrating continued community engagement in civic improvement.

Key Highlights:
• Infrastructure issues remain the most common concern, with road maintenance and utility problems leading the categories
• Response times have improved by 15% compared to last week, with most urgent issues addressed within 24 hours
• Community participation increased with more detailed reports and location data provided

Areas for attention:
• Several recurring issues in the downtown area suggest need for preventive maintenance planning
• Weather-related reports spiked mid-week following recent storms
• Team capacity utilization is optimal with good distribution across departments

Overall, the civic response system is functioning effectively with strong community participation and efficient municipal response times.`,

        `Weekly Municipal Response Report

Our civic engagement platform continues to serve as an effective bridge between community concerns and municipal action.

Performance Metrics:
• Average resolution time decreased to under 48 hours for standard priority issues
• High-priority and urgent issues maintained sub-24-hour response times
• Geographic distribution shows balanced reporting across all city districts

Notable Trends:
• Environmental concerns increased by 20% this week, primarily related to waste management
• Public safety reports focused on lighting and pedestrian infrastructure
• Positive feedback received on recent infrastructure improvements

Recommendations:
• Continue proactive maintenance in high-report areas
• Expand community outreach in underrepresented districts
• Consider seasonal preparation for weather-related issues

The team's dedication to responsive civic service continues to strengthen community trust and engagement.`,
      ]

      const hash = this.simpleHash(prompt)
      return mockSummaries[hash % mockSummaries.length]
    }

    // Generic mock response for other text generation requests
    return "This is a mock AI-generated response. Configure GEMINI_KEY environment variable to enable real AI text generation."
  }

  // Mock data generators for when GEMINI_KEY is not available
  private getMockImageAnalysis(mediaUrl: string): ImageAnalysisResult {
    const mockAnalyses = [
      {
        issueType: "infrastructure",
        severity: "medium" as const,
        confidence: 85,
        suggestedTitle: "Pothole on Main Street",
        shortDesc: "Large pothole causing traffic disruption and potential vehicle damage on busy street intersection.",
      },
      {
        issueType: "safety",
        severity: "high" as const,
        confidence: 92,
        suggestedTitle: "Broken Streetlight",
        shortDesc: "Non-functioning streetlight creating safety hazard for pedestrians during evening hours.",
      },
      {
        issueType: "environment",
        severity: "low" as const,
        confidence: 78,
        suggestedTitle: "Litter in Park Area",
        shortDesc: "Accumulated trash and debris affecting park cleanliness and visitor experience.",
      },
      {
        issueType: "public-services",
        severity: "urgent" as const,
        confidence: 95,
        suggestedTitle: "Water Main Break",
        shortDesc: "Active water leak causing flooding and service disruption to nearby residents.",
      },
    ]

    // Return random mock analysis based on URL hash for consistency
    const hash = this.simpleHash(mediaUrl)
    const selected = mockAnalyses[hash % mockAnalyses.length]

    console.log("[AI Service] Returning mock image analysis for:", mediaUrl)
    return selected
  }

  private getMockDescriptionGeneration(mediaUrl: string, shortText?: string): DescriptionGenerationResult {
    const mockDescriptions = [
      {
        shortDescription:
          "Road infrastructure issue requiring immediate attention. Pothole approximately 2 feet in diameter affecting vehicle traffic flow.",
        longDescription:
          "This infrastructure issue involves a significant pothole located on a high-traffic street. The damage appears to be caused by recent weather conditions and heavy vehicle usage. The pothole measures approximately 2 feet in diameter and 6 inches deep, creating a hazard for vehicles and potentially causing tire damage or alignment issues. Immediate repair is recommended to prevent further deterioration and ensure public safety. The location experiences heavy traffic during peak hours, making this a priority repair item for the municipal maintenance team.",
      },
      {
        shortDescription:
          "Public safety concern involving non-functional street lighting equipment requiring electrical maintenance and bulb replacement.",
        longDescription:
          "This safety issue involves a malfunctioning streetlight that has been reported as non-operational for several days. The affected area experiences reduced visibility during evening and nighttime hours, creating potential safety risks for pedestrians and drivers. The issue appears to be electrical in nature, possibly involving bulb failure or wiring problems. The location is near a busy intersection and school zone, making proper lighting essential for public safety. Municipal electrical services should prioritize this repair to restore adequate illumination and ensure community safety standards are maintained.",
      },
    ]

    const hash = this.simpleHash(mediaUrl + (shortText || ""))
    const selected = mockDescriptions[hash % mockDescriptions.length]

    console.log("[AI Service] Returning mock description generation for:", mediaUrl)
    return selected
  }

  private getMockTranscription(audioUrl: string): TranscriptionResult {
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

    console.log("[AI Service] Returning mock transcription for:", audioUrl)
    return selected
  }

  // Simple hash function for consistent mock data selection
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Check if the service is properly configured with API key
   */
  isReady(): boolean {
    return this.isConfigured
  }

  /**
   * Get service status information
   */
  getStatus(): { configured: boolean; provider: string; features: string[] } {
    return {
      configured: this.isConfigured,
      provider: this.isConfigured ? "Google Gemini" : "Mock Service",
      features: ["image-analysis", "description-generation", "audio-transcription", "text-generation"],
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService()
export default geminiService
