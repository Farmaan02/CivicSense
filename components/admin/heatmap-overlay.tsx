"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Layers, TrendingUp } from "lucide-react"
import { api } from "@/utils/api"

// Global Google Maps interface declaration
// Note: This is a simplified declaration for heatmap functionality
// In a production environment, you would import proper Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  status: string
  priority: string
  category: string
}

interface HeatmapOverlayProps {
  map: unknown | null
  onToggle?: (enabled: boolean) => void
}

export function HeatmapOverlay({ map, onToggle }: HeatmapOverlayProps) {
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(false)
  const heatmapRef = useRef<any>(null)

  // Load heatmap data from analytics API
  const loadHeatmapData = useCallback(async () => {
    try {
      setLoading(true)

      const response = await api.getAnalyticsHeatmapData()
      setHeatmapData(response.data || [])
    } catch (error: unknown) {
      console.error("Failed to load heatmap data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize heatmap data on component mount
  useEffect(() => {
    loadHeatmapData()
  }, [loadHeatmapData])

  // Toggle heatmap overlay
  const toggleHeatmap = (enabled: boolean) => {
    setHeatmapEnabled(enabled)
    onToggle?.(enabled)

    if (!map || !window.google) {
      console.warn('Google Maps API not loaded')
      return
    }

    // Check if API key is properly configured
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'PLACEHOLDER_API_KEY' || 
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Google Maps API key not configured properly')
      return
    }

    if (enabled && heatmapData.length > 0) {
      // Create heatmap points with weighted intensity
      const heatmapPoints = heatmapData.map((point): { location: unknown; weight: number } => {
        // Weight intensity based on priority and status
        let weight = point.intensity

        // Increase weight for urgent/high priority issues
        if (point.priority === "urgent") weight *= 3
        else if (point.priority === "high") weight *= 2

        // Increase weight for unresolved issues
        if (point.status === "reported") weight *= 1.5
        else if (point.status === "in-progress") weight *= 1.2

        return {
          location: new window.google.maps.LatLng(point.lat, point.lng),
          weight: weight,
        }
      })

      // Create heatmap layer
      heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapPoints,
        map: map,
        radius: 50,
        opacity: 0.6,
        gradient: [
          "rgba(0, 255, 255, 0)",
          "rgba(0, 255, 255, 1)",
          "rgba(0, 191, 255, 1)",
          "rgba(0, 127, 255, 1)",
          "rgba(0, 63, 255, 1)",
          "rgba(0, 0, 255, 1)",
          "rgba(0, 0, 223, 1)",
          "rgba(0, 0, 191, 1)",
          "rgba(0, 0, 159, 1)",
          "rgba(0, 0, 127, 1)",
          "rgba(63, 0, 91, 1)",
          "rgba(127, 0, 63, 1)",
          "rgba(191, 0, 31, 1)",
          "rgba(255, 0, 0, 1)",
        ],
      } as unknown as typeof window.google.maps.visualization.HeatmapLayer)
    } else if (heatmapRef.current) {
      // Remove heatmap layer
      heatmapRef.current.setMap(null)
      heatmapRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null)
      }
    }
  }, [])

  return (
    <Card className="absolute top-4 left-4 w-64 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Heatmap Overlay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="heatmap-toggle" className="text-sm">
            Show Heatmap
          </Label>
          <Switch
            id="heatmap-toggle"
            checked={heatmapEnabled}
            onCheckedChange={toggleHeatmap}
            disabled={loading || heatmapData.length === 0}
          />
        </div>

        {heatmapEnabled && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3" />
                Density Indicators
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm"></div>
                  <span>Low density</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-sm"></div>
                  <span>Medium density</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-gradient-to-r from-red-500 to-red-700 rounded-sm"></div>
                  <span>High density</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Intensity weighted by priority and status</p>
              <p className="mt-1">{heatmapData.length} data points</p>
            </div>
          </div>
        )}

        {heatmapData.length === 0 && !loading && (
          <div className="text-xs text-muted-foreground">No location data available for heatmap</div>
        )}

        {loading && <div className="text-xs text-muted-foreground">Loading heatmap data...</div>}

        <Button
          variant="outline"
          size="sm"
          onClick={loadHeatmapData}
          disabled={loading}
          className="w-full bg-transparent"
        >
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  )
}
