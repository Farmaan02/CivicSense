"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface CameraUploaderProps {
  onMediaSelect: (file: File) => void
  currentMedia: File | null
}

export function CameraUploader({ onMediaSelect, currentMedia }: CameraUploaderProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onMediaSelect(file)
    }
  }

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const handleGallerySelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Add Photo or Video</Label>

      {currentMedia ? (
        <Card className="border-2 border-civic-primary/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-civic-primary/10 rounded-full flex items-center justify-center">
                <span className="text-civic-primary">{currentMedia.type.startsWith("image/") ? "📷" : "🎥"}</span>
              </div>
              <div>
                <p className="font-medium text-civic-primary">{currentMedia.name}</p>
                <p className="text-sm text-gray-500">{(currentMedia.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMediaSelect(null as unknown as File)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-civic-primary/30 p-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-civic-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-civic-primary text-xl">📷</span>
              </div>
              <p className="text-civic-primary font-medium">Capture or Upload Media</p>
              <p className="text-sm text-gray-500">Photos and videos help us understand the issue better</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                className="flex-1 bg-civic-primary text-white hover:bg-civic-accent border-civic-primary"
              >
                📷 Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGallerySelect}
                className="flex-1 bg-transparent text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white"
              >
                📁 Choose File
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
