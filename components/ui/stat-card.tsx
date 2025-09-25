import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error"
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, trend, variant = "default", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "primary":
          return "border-t-4 border-t-primary"
        case "secondary":
          return "border-t-4 border-t-secondary"
        case "success":
          return "border-t-4 border-t-success"
        case "warning":
          return "border-t-4 border-t-warning"
        case "error":
          return "border-t-4 border-t-error"
        default:
          return "border-t-4 border-t-border"
      }
    }

    return (
      <Card className={cn("civic-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1", getVariantClasses(), className)} ref={ref} {...props}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {icon && (
              <div className="p-2 rounded-lg bg-muted">
                {icon}
              </div>
            )}
            <span className="text-lg">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">{value}</div>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {trend && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Trend</div>
                <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = "StatCard"

export { StatCard }