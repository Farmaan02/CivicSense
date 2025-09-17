"use client"

import { useEffect, useRef, useState } from "react"
import { HeatmapOverlay } from "./heatmap-overlay"
// Note: Google Maps API should be loaded via script tag in _document.tsx or layout
// Declaring global google maps interface
declare global {
  interface Window {
    google: any;
  }
}

interface Report {
  id: string
  trackingId: string
  title: string
  description: string
  status: "reported" | "in-review" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  location: {
    lat: number
    lng: number
    address?: string
  }
  createdAt: string
}

interface ReportsMapProps {
  reports: Report[]
}

const statusColors = {
  reported: "#3b82f6",
  "in-review": "#eab308",
  "in-progress": "#f97316",
  resolved: "#22c55e",
  closed: "#6b7280",
}

export function ReportsMap({ reports }: ReportsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!window.google) {
      console.warn('Google Maps API not loaded');
      return;
    }

    // Check if API key is properly configured
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'PLACEHOLDER_API_KEY' || 
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Google Maps API key not configured properly');
      return;
    }

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    mapInstanceRef.current = map
    setMapLoaded(true)

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add markers for reports
    reports.forEach((report) => {
      const marker = new window.google.maps.Marker({
        position: { lat: report.location.lat, lng: report.location.lng },
        map: map,
        title: report.trackingId,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: statusColors[report.status],
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-sm">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-sm">${report.trackingId}</h3>
              <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                ${report.status.replace("-", " ")}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">
              ${report.description}
            </p>
            <div class="text-xs text-gray-500">
              ${new Date(report.createdAt).toLocaleDateString()}
            </div>
            ${
              report.location.address
                ? `
              <div class="text-xs text-gray-500 mt-1">
                📍 ${report.location.address}
              </div>
            `
                : ""
            }
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (reports.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      reports.forEach((report) => {
        bounds.extend({ lat: report.location.lat, lng: report.location.lng })
      })
      map.fitBounds(bounds)

      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 15) map.setZoom(15)
        window.google.maps.event.removeListener(listener)
      })
    }

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null))
    }
  }, [reports])

  const isGoogleMapsConfigured = () => {
    return window.google && 
           process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
           process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'PLACEHOLDER_API_KEY' && 
           process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE';
  };

  return (
    <div className="relative h-full w-full">
      {!isGoogleMapsConfigured() ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Google Maps API Not Configured</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              To enable the map view, please configure your Google Maps API key in the environment variables.
            </p>
            <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded font-mono">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Get your API key from: <br />
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Google Cloud Console
              </a>
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="h-full w-full rounded-lg" />

          {mapLoaded && mapInstanceRef.current && <HeatmapOverlay map={mapInstanceRef.current} />}

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
            <h4 className="text-sm font-semibold mb-2">Status Legend</h4>
            <div className="space-y-1">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                  <span className="capitalize">{status.replace("-", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          {reports.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <p className="text-sm">No reports with location data found</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
