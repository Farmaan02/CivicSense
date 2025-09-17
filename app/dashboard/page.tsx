"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening in your community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                My Reports
              </CardTitle>
              <CardDescription>Issues you've reported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">3</div>
              <p className="text-sm text-muted-foreground">2 in progress, 1 resolved</p>
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                View All Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🗳️</span>
                Active Polls
              </CardTitle>
              <CardDescription>Community voting opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">2</div>
              <p className="text-sm text-muted-foreground">New polls available</p>
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                View Polls
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📅</span>
                Upcoming Events
              </CardTitle>
              <CardDescription>Community meetings and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">1</div>
              <p className="text-sm text-muted-foreground">Town hall meeting this week</p>
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                View Events
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col gap-2">
                  <span className="text-2xl">📸</span>
                  <span>Report Issue</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <span className="text-2xl">💬</span>
                  <span>Join Discussion</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <span className="text-2xl">🗺️</span>
                  <span>View Map</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <span className="text-2xl">⚙️</span>
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
