"use client"
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface Report {
  _id: string
  id: string
  trackingId: string
  title: string
  description: string
  status: string
  severity: string
  priority: string
  createdAt: string
  updatedAt: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  mediaUrl?: string
  contactInfo?: string
  createdBy: string
  anonymous: boolean
  category: string
  viewCount: number
  upvotes: number
  downvotes: number
}

interface MapViewProps {
  reports: Report[]
  onMarkerClick?: (report: Report) => void
  className?: string
}

export function MapView({ reports, onMarkerClick, className = "" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [leaflet, setLeaflet] = useState<any>(null)
  // const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      try {
        // Load Leaflet CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Load Leaflet JS
        const L = await import("leaflet")

        // Fix default markers
        delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        setLeaflet(L)
      } catch (error) {
        console.error("[v0] Error loading Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapRef.current || map) return

    // Filter reports to only include those with location data
    const reportsWithLocation = reports.filter(report => report.location)

    const defaultCenter = reportsWithLocation.length > 0 ? 
      [reportsWithLocation[0].location!.lat, reportsWithLocation[0].location!.lng] : 
      [40.7128, -74.006] // Default to NYC

    const newMap = leaflet.map(mapRef.current).setView(defaultCenter, 13)

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      })
      .addTo(newMap)

    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [leaflet, reports])

  // Add markers for reports
  useEffect(() => {
    if (!map || !leaflet) return

    // Filter reports to only include those with location data
    const reportsWithLocation = reports.filter(report => report.location)

    // Clear existing markers
    map.eachLayer((layer: unknown) => {
      if (layer instanceof leaflet.Marker) {
        map.removeLayer(layer)
      }
    })

    // Create custom icons based on severity
    const createIcon = (severity: string) => {
      const color = severity === "high" ? "#dc2626" : severity === "medium" ? "#ea580c" : "#16a34a"

      return leaflet.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: "custom-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })
    }

    // Add markers
    const bounds = leaflet.latLngBounds()

    reportsWithLocation.forEach((report) => {
      if (report.location?.lat && report.location?.lng) {
        const marker = leaflet
          .marker([report.location.lat, report.location.lng], { icon: createIcon(report.severity || "low") })
          .addTo(map)

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">
              ${report.title || "Civic Issue Report"}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
              ${report.description.substring(0, 100)}${report.description.length > 100 ? "..." : ""}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="font-size: 11px; color: #9ca3af;">
                ${new Date(report.createdAt).toLocaleDateString()}
              </span>
              <button 
                onclick="window.viewReportDetail('${report._id}')"
                style="background: #A3B18A; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;"
              >
                View Details
              </button>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)

        marker.on("click", () => {
          if (onMarkerClick) {
            onMarkerClick(report)
          }
        })

        bounds.extend([report.location.lat, report.location.lng])
      }
    })

    // Fit map to show all markers
    if (reportsWithLocation.length > 1) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [map, leaflet, reports])

  // Global function for popup buttons
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as unknown as { viewReportDetail?: (reportId: string) => void }).viewReportDetail = (reportId: string) => {
        const report = reports.find((r) => r._id === reportId)
        if (report && onMarkerClick) {
          onMarkerClick(report)
        }
      }
    }
  }, [reports, onMarkerClick])

  if (!leaflet) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="space-y-2">
          <div className="w-8 h-8 border-2 border-civic-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg overflow-hidden" />

      {/* Map Legend */}
      <Card className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-sm">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Issue Severity</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Low</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Count */}
      <Card className="absolute bottom-4 left-4 p-2 bg-white/95 backdrop-blur-sm">
        <p className="text-sm font-medium text-gray-700">
          {reports.filter(r => r.location).length} {reports.filter(r => r.location).length === 1 ? "Report" : "Reports"} with location
        </p>
      </Card>
    </div>
  )
}