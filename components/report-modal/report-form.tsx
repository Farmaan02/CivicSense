"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CameraUploader } from "@/components/media/camera-uploader"
import { VoiceRecorder } from "@/components/media/voice-recorder"
import { LocationPicker } from "@/components/location/location-picker"
import { apiClient, type AIAnalysisResult } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { useNotificationContext } from "@/components/notifications/notification-provider"
import { Loader2, Sparkles, Brain } from "lucide-react"

interface ReportFormProps {
  onClose: () => void
}

interface LocationData {
  lat: number
  lng: number
  address?: string
}

export function ReportForm({ onClose }: ReportFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    contactInfo: "",
    anonymous: false,
    useLocation: true,
    media: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const { showNotification } = useNotificationContext()

  useEffect(() => {
    if (mediaUrl && formData.media?.type.startsWith("image/")) {
      handleAIAnalysis(mediaUrl)
    }
  }, [mediaUrl])

  const handleAIAnalysis = async (url: string) => {
    setIsAnalyzing(true)
    try {
      console.log("[v0] Starting AI analysis for:", url)
      const analysis = await apiClient.analyzeImage(url)
      setAiAnalysis(analysis)

      if (analysis.suggestedTitle && !formData.description) {
        setFormData((prev) => ({
          ...prev,
          description: analysis.shortDesc || analysis.suggestedTitle,
        }))
      }

      toast({
        title: "AI Analysis Complete",
        description: `Detected: ${analysis.issueType} (${analysis.confidence}% confidence)`,
        duration: 4000,
      })
    } catch (error) {
      console.error("[v0] AI analysis failed:", error)
      toast({
        title: "AI Analysis Failed",
        description: "Continuing without AI suggestions",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const reportData = {
        description: formData.description,
        contactInfo: formData.contactInfo || undefined,
        anonymous: formData.anonymous,
        useLocation: formData.useLocation,
        media: formData.media || undefined,
        location: formData.useLocation ? location : undefined,
      }

      console.log("[v0] Submitting report:", reportData)

      const response = await apiClient.createReport(reportData)

      console.log("[v0] Report created successfully:", response)

      showNotification("report.created", {
        trackingId: response.trackingId,
        description: formData.description,
        location: location,
        anonymous: formData.anonymous,
      })

      window.dispatchEvent(
        new CustomEvent("civiccare-notification", {
          detail: {
            type: "report.created",
            data: {
              trackingId: response.trackingId,
              description: formData.description,
              location: location,
              anonymous: formData.anonymous,
            },
          },
        }),
      )

      onClose()
    } catch (error) {
      console.error("[v0] Error submitting report:", error)

      toast({
        title: "Error Submitting Report",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMediaSelect = async (file: File | null) => {
    setFormData((prev) => ({ ...prev, media: file }))
    setAiAnalysis(null) // Reset previous analysis

    if (file) {
      try {
        // Upload media first to get URL for AI analysis
        const uploadResponse = await apiClient.uploadMedia(file)
        setMediaUrl(uploadResponse.url)
      } catch (error) {
        console.error("[v0] Media upload failed:", error)
        toast({
          title: "Media Upload Failed",
          description: "AI analysis will not be available",
          variant: "destructive",
          duration: 3000,
        })
      }
    } else {
      setMediaUrl(null)
    }
  }

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log("[v0] Voice recording completed:", audioBlob)
  }

  const handleTranscriptionRequest = (audioBlob: Blob) => {
    // Placeholder for transcription - will be implemented in later milestone
    toast({
      title: "Transcription Coming Soon",
      description: "Voice-to-text feature will be available in the next update.",
      duration: 3000,
    })
  }

  const handleLocationChange = (newLocation: LocationData | null) => {
    setLocation(newLocation)
  }

  const handleUseLocationChange = (use: boolean) => {
    setFormData((prev) => ({ ...prev, useLocation: use }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CameraUploader onMediaSelect={handleMediaSelect} currentMedia={formData.media} />

      {(isAnalyzing || aiAnalysis) && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">AI Analysis</span>
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </div>

          {isAnalyzing && <p className="text-sm text-blue-700">Analyzing your image...</p>}

          {aiAnalysis && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {aiAnalysis.issueType}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`${
                    aiAnalysis.severity === "urgent"
                      ? "bg-red-100 text-red-800"
                      : aiAnalysis.severity === "high"
                        ? "bg-orange-100 text-orange-800"
                        : aiAnalysis.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {aiAnalysis.severity} priority
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                <strong>AI Suggestion:</strong> {aiAnalysis.shortDesc}
              </p>
              <p className="text-xs text-gray-500">AI confidence: {aiAnalysis.confidence}%</p>
            </div>
          )}
        </div>
      )}

      <LocationPicker
        onLocationChange={handleLocationChange}
        useLocation={formData.useLocation}
        onUseLocationChange={handleUseLocationChange}
      />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Describe the issue
          {aiAnalysis && (
            <span className="ml-2 text-sm text-blue-600 font-normal">
              <Sparkles className="inline h-3 w-3 mr-1" />
              AI-suggested
            </span>
          )}
        </Label>
        <Textarea
          id="description"
          placeholder="What's the problem? Be as specific as possible..."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="min-h-[100px] text-base"
          required
        />

        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onTranscriptionRequest={handleTranscriptionRequest}
        />
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        <Label htmlFor="contact" className="text-base font-medium">
          Contact info (optional)
        </Label>
        <Input
          id="contact"
          type="email"
          placeholder="your.email@example.com"
          value={formData.contactInfo}
          onChange={(e) => setFormData((prev) => ({ ...prev, contactInfo: e.target.value }))}
          className="text-base"
        />
        <p className="text-sm text-gray-500">We'll send you updates about your report</p>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <Label className="text-base font-medium">Submit anonymously</Label>
          <p className="text-sm text-gray-600">Your contact info won't be shared publicly</p>
        </div>
        <Switch
          checked={formData.anonymous}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, anonymous: checked }))}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 bg-transparent"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-civic-primary hover:bg-civic-accent text-white"
          disabled={isSubmitting || isAnalyzing}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </form>
  )
}
