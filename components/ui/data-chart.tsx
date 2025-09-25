import * as React from "react"
import { cn } from "@/lib/utils"

interface DataChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  title?: string
  description?: string
  maxValue?: number
}

const DataChart = React.forwardRef<HTMLDivElement, DataChartProps>(
  ({ className, data, title, description, maxValue, ...props }, ref) => {
    const max = maxValue || Math.max(...data.map(item => item.value), 0)
    
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {title && (
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

DataChart.displayName = "DataChart"

export { DataChart }