"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Clock, MapPin, FileText, Download, BarChart3 } from "lucide-react"
import { api } from "@/utils/api"

interface AnalyticsData {
  mostCommon: Array<{ category: string; count: number }>
  avgResolutionTime: {
    averageResolutionTimeHours: number
    resolvedCount: number
    period: string
  }
  topLocations: Array<{ address: string; count: number }>
  weeklySummary: {
    summary: string
    data: {
      totalReports: number
      statusBreakdown: Record<string, number>
      categoryBreakdown: Record<string, number>
      resolvedCount: number
    }
    generatedAt: string
    aiGenerated: boolean
  }
}

const COLORS = ["#164e63", "#f97316", "#059669", "#dc2626", "#7c3aed", "#ea580c"]

export function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month">("week")
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)

  const generateWeeklySummary = useCallback(async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)

      return await api.getAnalyticsWeeklySummary(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      )
    } catch (error) {
      console.error("Failed to generate weekly summary:", error)
      return {
        summary: "Unable to generate summary at this time.",
        data: { totalReports: 0, statusBreakdown: {}, categoryBreakdown: {}, resolvedCount: 0 },
        generatedAt: new Date().toISOString(),
        aiGenerated: false,
      }
    }
  }, [])

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)

      const [mostCommonRes, avgTimeRes, topLocationsRes, summaryRes] = await Promise.all([
        api.getAnalyticsMostCommon(period),
        api.getAnalyticsResolutionTime(period),
        api.getAnalyticsTopLocations(10),
        generateWeeklySummary(),
      ])

      setAnalytics({
        mostCommon: mostCommonRes.data || [],
        avgResolutionTime: avgTimeRes,
        topLocations: topLocationsRes.data || [],
        weeklySummary: summaryRes,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [generateWeeklySummary, period])

  useEffect(() => {
    loadAnalytics()
  }, [period, loadAnalytics])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load analytics data</div>
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        </div>
        <Select value={period} onValueChange={(value: "week" | "month") => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgResolutionTime.averageResolutionTimeHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {analytics.avgResolutionTime.resolvedCount} resolved reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most Common Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{analytics.mostCommon[0]?.category || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.mostCommon[0]?.count || 0} reports this {period}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Top Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold line-clamp-1">
              {analytics.topLocations[0]?.address || "No location data"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{analytics.topLocations[0]?.count || 0} reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Issues Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Most Common Issues ({period})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.mostCommon.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#164e63" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.weeklySummary.data.statusBreakdown).map(([status, count]) => ({
                      name: status.replace("-", " "),
                      value: count,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.weeklySummary.data.statusBreakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Top Locations by Report Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topLocations.slice(0, 5).map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{location.address}</span>
                </div>
                <Badge variant="secondary">{location.count} reports</Badge>
              </div>
            ))}
            {analytics.topLocations.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No location data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Weekly Summary
              {analytics.weeklySummary.aiGenerated && (
                <Badge variant="secondary" className="ml-2">
                  AI Generated
                </Badge>
              )}
            </CardTitle>
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Weekly Summary Report</DialogTitle>
                  <DialogDescription>
                    Generated on {new Date(analytics.weeklySummary.generatedAt).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Summary</Label>
                    <Textarea value={analytics.weeklySummary.summary} readOnly className="mt-2 min-h-[200px]" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => copyToClipboard(analytics.weeklySummary.summary)}>
                      <Download className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm leading-relaxed line-clamp-3">{analytics.weeklySummary.summary}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Generated: {new Date(analytics.weeklySummary.generatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
