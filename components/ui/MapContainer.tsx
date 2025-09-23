"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  ZoomIn, 
  ZoomOut, 
  Locate, 
  Layers,
  MapPin,
  Home,
  Plus,
  Minus
} from "lucide-react"

interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onZoomIn?: () => void
  onZoomOut?: () => void
  onLocate?: () => void
  onLayerChange?: () => void
  showControls?: boolean
  className?: string
}

const MapContainer = React.forwardRef<HTMLDivElement, MapContainerProps>(
  (
    {
      children,
      onZoomIn,
      onZoomOut,
      onLocate,
      onLayerChange,
      showControls = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-full w-full overflow-hidden rounded-2xl border bg-muted", className)}
        {...props}
      >
        {children}
        
        {showControls && (
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <Card className="flex flex-col gap-1 p-2 shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={onZoomIn}
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="h-px w-full bg-border" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={onZoomOut}
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </Card>
            
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={onLocate}
              aria-label="Locate me"
            >
              <Locate className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={onLayerChange}
              aria-label="Change map layer"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4">
          <Card className="flex items-center gap-2 px-3 py-2 shadow-lg">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Interactive Map</span>
          </Card>
        </div>
      </div>
    )
  }
)
MapContainer.displayName = "MapContainer"

export { MapContainer }