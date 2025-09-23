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
import { apiClient, type AIAnalysisResult, type CreateReportRequest } from "@/utils/api"
import { useToastWrapper } from "@/components/ui/toast-wrapper"
import { useNotificationContext } from "@/components/notifications/notification-provider"
import { Loader2, Sparkles, Brain } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reportSchema, type ReportFormData } from "@/lib/form-validation"

interface ReportFormProps {
  onClose: () => void
}

interface LocationData {
  lat: number
  lng: number
  address?: string
}

export function ReportForm({ onClose }: ReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const { showToast, showErrorToast, showSuccessToast } = useToastWrapper()
  const { showNotification } = useNotificationContext()

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      description: "",
      anonymous: false,
      useLocation: true,
      contactInfo: "",
      media: undefined,
    }
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form

  // Watch form values
  const useLocationValue = watch("useLocation")
  const media = watch("media")

  useEffect(() => {
    if (mediaUrl && media && media[0] && media[0] instanceof File && media[0].type.startsWith("image/")) {
      handleAIAnalysis(mediaUrl)
    }
  }, [mediaUrl, media])

  const handleAIAnalysis = async (url: string) => {
    setIsAnalyzing(true)
    try {
      console.log("[v0] Starting AI analysis for:", url)
      const analysis = await apiClient.analyzeImage(url)
      setAiAnalysis(analysis)

      // Update description with AI suggestion if available
      if (analysis.shortDesc) {
        setValue("description", analysis.shortDesc)
      }

      showSuccessToast("AI Analysis Complete", `Detected: ${analysis.issueType} (${analysis.confidence}% confidence)`)
    } catch (error) {
      console.error("[v0] AI analysis failed:", error)
      showErrorToast("AI Analysis Failed", "Continuing without AI suggestions")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true)

    try {
      // Build report data object with proper conditional inclusion
      const reportData: CreateReportRequest = {
        description: data.description,
        anonymous: data.anonymous,
        useLocation: data.useLocation,
      }

      // Only add contactInfo if provided
      if (data.contactInfo && data.contactInfo.trim().length > 0) {
        reportData.contactInfo = data.contactInfo
      }

      // Only add media if provided
      if (data.media && data.media.length > 0) {
        reportData.media = data.media[0]
      }

      // Only add location if useLocation is true and location data exists
      if (data.useLocation && location) {
        reportData.location = {
          lat: location.lat,
          lng: location.lng,
          address: location.address || undefined
        }
      }

      console.log("[v0] Submitting report:", reportData)

      const response = await apiClient.createReport(reportData)

      console.log("[v0] Report created successfully:", response)

      showNotification("report.created", {
        trackingId: response.trackingId,
        description: data.description,
        location: location,
        anonymous: data.anonymous,
      })

      window.dispatchEvent(
        new CustomEvent("civiccare-notification", {
          detail: {
            type: "report.created",
            data: {
              trackingId: response.trackingId,
              description: data.description,
              location: location,
              anonymous: data.anonymous,
            },
          },
        }),
      )

      onClose()
    } catch (error) {
      console.error("[v0] Error submitting report:", error)
      showErrorToast("Error Submitting Report", error instanceof Error ? error.message : "Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMediaSelect = async (file: File | null) => {
    if (file) {
      try {
        // Upload media first to get URL for AI analysis
        const uploadResponse = await apiClient.uploadMedia(file)
        setMediaUrl(uploadResponse.url)
        setValue("media", [file])
      } catch (error) {
        console.error("[v0] Media upload failed:", error)
        showErrorToast("Media Upload Failed", "AI analysis will not be available")
      }
    } else {
      setMediaUrl(null)
      setValue("media", undefined)
    }
  }

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log("[v0] Voice recording completed:", audioBlob)
  }

  const handleTranscriptionRequest = (audioBlob: Blob) => {
    // Placeholder for transcription - will be implemented in later milestone
    showToast({
      title: "Transcription Coming Soon",
      description: "Voice-to-text feature will be available in the next update.",
      duration: 3000,
    })
  }

  const handleLocationChange = (newLocation: LocationData | null) => {
    setLocation(newLocation)
  }

  const handleUseLocationChange = (use: boolean) => {
    setValue("useLocation", use)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <CameraUploader onMediaSelect={handleMediaSelect} currentMedia={media?.[0] || null} />

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
        useLocation={useLocationValue}
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
          {...register("description")}
          className="min-h-[100px] text-base"
        />
        {errors.description && <p className="text-sm text-red-500">{String(errors.description.message)}</p>}

        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onTranscriptionRequest={handleTranscriptionRequest}
        />
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        <Label htmlFor="contactInfo" className="text-base font-medium">
          Contact info (optional)
        </Label>
        <Input
          id="contactInfo"
          type="email"
          placeholder="your.email@example.com"
          {...register("contactInfo")}
          className="text-base"
        />
        {errors.contactInfo && <p className="text-sm text-red-500">{String(errors.contactInfo.message)}</p>}
        <p className="text-sm text-gray-500">We'll send you updates about your report</p>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <Label className="text-base font-medium">Submit anonymously</Label>
          <p className="text-sm text-gray-600">Your contact info won't be shared publicly</p>
        </div>
        <Switch
          checked={watch("anonymous")}
          onCheckedChange={(checked) => setValue("anonymous", checked)}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </form>
  )
}