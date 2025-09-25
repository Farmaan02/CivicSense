"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface LocationPickerProps {
  onLocationChange: (location: LocationData | null) => void
  useLocation: boolean
  onUseLocationChange: (use: boolean) => void
}

export function LocationPicker({ onLocationChange, useLocation, onUseLocationChange }: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [manualAddress, setManualAddress] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Auto-detect location when useLocation is enabled
  useEffect(() => {
    if (useLocation) {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser.")
        return
      }

      setIsDetecting(true)
      setLocationError(null)

      console.log("[LocationPicker] Starting location detection...")

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("[LocationPicker] Location detected:", position.coords)
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          // Try to get address from coordinates (reverse geocoding)
          try {
            const address = await reverseGeocode(coords.lat, coords.lng)
            const locationData = { ...coords, address }
            setLocation(locationData)
            onLocationChange(locationData)
            console.log("[LocationPicker] Location set with address:", locationData)
          } catch (error) {
            console.warn("[LocationPicker] Reverse geocoding failed:", error)
            // If reverse geocoding fails, still use coordinates
            setLocation(coords)
            onLocationChange(coords)
            console.log("[LocationPicker] Location set with coordinates only:", coords)
          }

          setIsDetecting(false)
        },
        (error) => {
          console.error("[LocationPicker] Geolocation error:", error)
          let errorMessage = "Unable to access location. "
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Permission denied. Please allow location access and try again."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage += "Location request timed out. Please try again."
              break
            default:
              errorMessage += "An unknown error occurred."
              break
          }
          
          setLocationError(errorMessage)
          setIsDetecting(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 300000, // 5 minutes
        },
      )
    } else if (!useLocation) {
      setLocation(null)
      onLocationChange(null)
    }
  }, [useLocation, onLocationChange])

  // Enhanced reverse geocoding with actual address lookup
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Try using OpenStreetMap Nominatim for reverse geocoding (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicPulse/1.0'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.display_name) {
          console.log("[LocationPicker] Reverse geocoding successful:", data.display_name)
          return data.display_name
        }
      }
      
      // If the API call fails, try the browser's reverse geocoding (if available)
      if ('geocoder' in window && (window as any).google?.maps) {
        const geocoder = new (window as any).google.maps.Geocoder()
        return new Promise((resolve, reject) => {
          geocoder.geocode(
            { location: { lat, lng } },
            (results: any[], status: string) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0].formatted_address)
              } else {
                reject(new Error('Geocoding failed'))
              }
            }
          )
        })
      }
      
      // Fallback to coordinates if everything fails
      console.warn("[LocationPicker] Reverse geocoding failed, using coordinates")
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch (error) {
      console.warn("[LocationPicker] Reverse geocoding error:", error)
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  // Handle manual address input
  const handleAddressSubmit = async () => {
    if (!manualAddress.trim()) return

    try {
      // In a real app, you'd geocode the address to get coordinates
      // For now, we'll create a placeholder location
      const manualLocation: LocationData = {
        lat: 0, // Placeholder - would be geocoded
        lng: 0, // Placeholder - would be geocoded
        address: manualAddress,
      }

      setLocation(manualLocation)
      onLocationChange(manualLocation)
    } catch (error) {
      console.error("[v0] Error geocoding address:", error)
    }
  }

  const handleManualPinDrop = () => {
    // Placeholder for map pin drop functionality
    // This would open a map interface for pin dropping
    console.log("[v0] Manual pin drop requested")
  }

  return (
    <div className="space-y-4">
      {/* Location Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <Label className="text-base font-medium">Use my location</Label>
          <p className="text-sm text-gray-600">Help us find the exact spot of the issue</p>
        </div>
        <Switch checked={useLocation} onCheckedChange={onUseLocationChange} />
      </div>

      {/* Auto-detected Location */}
      {useLocation && (
        <Card className="p-4">
          {isDetecting && (
            <div className="flex items-center gap-2 text-civic-primary">
              <div className="w-4 h-4 border-2 border-civic-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Detecting your location...</span>
            </div>
          )}

          {location && !isDetecting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-civic-primary font-medium">
                <span>📍</span>
                <span>Location detected</span>
              </div>
              {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
              <p className="text-xs text-gray-500">
                Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          )}

          {locationError && <div className="text-red-600 text-sm">{locationError}</div>}
        </Card>
      )}

      {/* Manual Address Input */}
      {(!useLocation || locationError) && (
        <Card className="p-4 space-y-3">
          <Label className="text-base font-medium">Enter address manually</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Street address, city, state..."
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddressSubmit}
              variant="outline"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              Set
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleManualPinDrop}
              variant="outline"
              size="sm"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              📍 Drop Pin on Map
            </Button>
          </div>
        </Card>
      )}

      {/* Location Override */}
      {useLocation && location && !locationError && (
        <Card className="p-4 space-y-3">
          <Label className="text-sm font-medium text-gray-700">Need to adjust location?</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter different address..."
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              onClick={handleAddressSubmit}
              variant="outline"
              size="sm"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              Override
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
