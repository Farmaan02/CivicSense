"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onTranscriptionRequest?: (audioBlob: Blob) => void
}

export function VoiceRecorder({ onRecordingComplete, onTranscriptionRequest }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        onRecordingComplete(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleTranscribe = () => {
    if (audioBlob && onTranscriptionRequest) {
      onTranscriptionRequest(audioBlob)
    }
  }

  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Voice Input</span>
          {isRecording && <span className="text-red-600 font-mono text-sm">🔴 {formatTime(recordingTime)}</span>}
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              type="button"
              onClick={startRecording}
              className="bg-civic-primary hover:bg-civic-accent text-white"
              size="sm"
            >
              🎤 Start Recording
            </Button>
          ) : (
            <Button type="button" onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white" size="sm">
              ⏹️ Stop Recording
            </Button>
          )}

          {audioBlob && !isRecording && (
            <Button
              type="button"
              onClick={handleTranscribe}
              variant="outline"
              size="sm"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              📝 Add to Description
            </Button>
          )}
        </div>

        {audioBlob && !isRecording && (
          <div className="text-sm text-gray-600">✅ Recording saved ({formatTime(recordingTime)})</div>
        )}
      </div>
    </Card>
  )
}
