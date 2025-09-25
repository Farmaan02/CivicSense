"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Search } from "lucide-react"

interface LocationFilterProps {
  onLocationFilter: (location: { lat: number; lng: number } | { pincode: string }) => void
  className?: string
}

export function LocationFilter({ onLocationFilter, className = "" }: LocationFilterProps) {
  const [pincode, setPincode] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)

  const handleDetectLocation = () => {
    setIsDetecting(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false)
          onLocationFilter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsDetecting(false)
          // Fallback to manual pincode entry
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser")
      setIsDetecting(false)
    }
  }

  const handlePincodeSearch = () => {
    if (pincode.trim()) {
      onLocationFilter({ pincode: pincode.trim() })
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="flex-1"
          >
            {isDetecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Detecting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Use My Location
              </>
            )}
          </Button>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Enter pincode or postal code"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePincodeSearch()}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Button
            onClick={handlePincodeSearch}
            size="sm"
            className="absolute right-1 top-1 h-8"
          >
            Search
          </Button>
        </div>
      </div>
    </Card>
  )
}