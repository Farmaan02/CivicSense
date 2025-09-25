"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LocationFilter } from "@/components/location/location-filter"
import { apiClient, type Report } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { MapPin, RefreshCw } from "lucide-react"

export default function InYourAreaPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | { pincode: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getReports()
      setReports(data)
      setFilteredReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
      toast({
        title: "Error Loading Reports",
        description: error instanceof Error ? error.message : "Unable to load reports. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationFilter = async (locationFilter: { lat: number; lng: number } | { pincode: string }) => {
    setLocation(locationFilter)
    
    try {
      setLoading(true)
      
      if ("lat" in locationFilter) {
        // Filter by geolocation (5km radius)
        const nearbyReports = reports.filter(report => {
          if (!report.location) return false
          
          // Calculate distance using Haversine formula
          const R = 6371 // Earth radius in km
          const dLat = (report.location.lat - locationFilter.lat) * Math.PI / 180
          const dLon = (report.location.lng - locationFilter.lng) * Math.PI / 180
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(locationFilter.lat * Math.PI / 180) * Math.cos(report.location.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          const distance = R * c // Distance in km
          
          return distance <= 5 // 5km radius
        })
        
        setFilteredReports(nearbyReports)
      } else {
        // Filter by pincode (simplified - in real implementation, you'd geocode the pincode)
        // For now, we'll just filter by reports that contain the pincode in their address
        const pincodeReports = reports.filter(report => {
          if (!report.location?.address) return false
          return report.location.address.toLowerCase().includes(locationFilter.pincode.toLowerCase())
        })
        
        setFilteredReports(pincodeReports)
      }
    } catch (error) {
      console.error("Error filtering reports:", error)
      toast({
        title: "Error Filtering Reports",
        description: "Unable to filter reports by location. Showing all reports.",
        variant: "destructive",
        duration: 5000,
      })
      setFilteredReports(reports)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading && filteredReports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-civic-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Loading Reports</h2>
              <p className="text-gray-600">Fetching community reports in your area...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:pl-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issues in Your Area</h1>
              <p className="text-gray-600 mt-1">View reported issues near you</p>
            </div>
            <Button
              onClick={loadReports}
              variant="outline"
              className="text-civic-primary border-civic-primary hover:bg-civic-primary hover:text-white bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:pl-4">
        <LocationFilter onLocationFilter={handleLocationFilter} className="mb-6" />
        
        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredReports.length} of {reports.length} reports
            {location && (
              <span className="ml-2">
                {("lat" in location) 
                  ? " (within 5km radius)" 
                  : ` (near pincode: ${location.pincode})`}
              </span>
            )}
          </p>
          {location && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLocation(null)
                setFilteredReports(reports)
              }}
            >
              Clear Filter
            </Button>
          )}
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {location ? "No Reports Found in Your Area" : "No Reports Available"}
                </h3>
                <p className="text-gray-600">
                  {location 
                    ? "There are no reports in your selected area. Try adjusting your location filter or check back later." 
                    : "No reports have been submitted yet."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-500">#{report.trackingId}</p>
                    </div>
                    <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm line-clamp-3">{report.description}</p>

                  {/* Media Preview */}
                  {report.mediaUrl && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={report.mediaUrl || "/placeholder.svg"}
                        alt="Report media"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  {/* Location */}
                  {report.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {report.location.address ||
                          `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>👁️ {report.viewCount}</span>
                      <span>👍 {report.upvotes}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}