"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Award, TrendingUp } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export function CommunityImpact() {
  const { t } = useTranslation()

  const impactStats = [
    {
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      value: "1,247",
      label: t("community.issuesResolved"),
      color: "border-l-yellow-500"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      value: "89%",
      label: t("community.satisfaction"),
      color: "border-l-red-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      value: "24h",
      label: t("community.responseTime"),
      color: "border-l-green-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {impactStats.map((stat, index) => (
        <Card 
          key={index} 
          className={`civic-card border-l-4 ${stat.color} hover:shadow-lg transition-all duration-300 animate-float`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {stat.icon}
              <div>
                <div className="font-bold text-lg">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
    </div>
  )
}