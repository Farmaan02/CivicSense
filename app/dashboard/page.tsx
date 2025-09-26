"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Flame, CheckCircle, Calendar, MessageCircle, Settings, Camera, Users, BarChart2, Heart, Award, TrendingUp, Eye, Clock, ThumbsUp } from "lucide-react"
// ... existing code ...

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
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 md:pl-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here&apos;s what&apos;s happening in your community</p>
        </div>

        {/* Enhanced Motivational Banner */}
        <div className="mb-8 bg-gradient-to-r from-civic-primary to-civic-accent rounded-2xl p-6 text-white shadow-lg animate-pulse-slow border border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold">Make a Difference Today!</h2>
              <p className="text-white/90">Your reports help improve our community for everyone</p>
            </div>
            <div className="animate-bounce">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="civic-card border-t-4 border-t-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-lg">My Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">3</div>
                  <p className="text-sm text-muted-foreground mt-1">2 in progress, 1 resolved</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Last 30 days</div>
                  <div className="flex items-center text-xs text-green-600">
                    <Flame className="h-3 w-3 mr-1" />
                    +12%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="civic-card border-t-4 border-t-success hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-lg">Active Polls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">2</div>
                  <p className="text-sm text-muted-foreground mt-1">New polls available</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Participation</div>
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    68%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="civic-card border-t-4 border-t-secondary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-lg">Upcoming Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">1</div>
                  <p className="text-sm text-muted-foreground mt-1">Town hall meeting this week</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Next event</div>
                  <div className="text-xs text-foreground font-medium">Thu, 2 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="civic-card border-t-4 border-t-warning hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <span className="text-lg">Community Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">75%</div>
                  <p className="text-sm text-muted-foreground mt-1">Issues resolved</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Your impact</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="civic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <Settings className="h-5 w-5" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks you can perform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-28 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 civic-transition group relative overflow-hidden" onClick={() => window.location.href = '/report'}>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <Camera className="h-6 w-6 group-hover:scale-110 transition-transform z-10 relative" />
                    <span className="text-base font-semibold z-10 relative">Report Issue</span>
                    <span className="text-xs text-white/80 z-10 relative">Make your voice heard</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 civic-transition group relative overflow-hidden" onClick={() => window.location.href = '/forums'}>
                    <div className="absolute inset-0 bg-blue-50/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform z-10 relative" />
                    <span className="text-base font-semibold z-10 relative">Join Discussion</span>
                    <span className="text-xs text-gray-500 z-10 relative">Connect with neighbors</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 civic-transition group relative overflow-hidden" onClick={() => window.location.href = '/map'}>
                    <div className="absolute inset-0 bg-green-50/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <BarChart2 className="h-6 w-6 group-hover:scale-110 transition-transform z-10 relative" />
                    <span className="text-base font-semibold z-10 relative">View Map</span>
                    <span className="text-xs text-gray-500 z-10 relative">See community progress</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 civic-transition group relative overflow-hidden" onClick={() => window.location.href = '/settings'}>
                    <div className="absolute inset-0 bg-purple-50/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <Settings className="h-6 w-6 group-hover:scale-110 transition-transform z-10 relative" />
                    <span className="text-base font-semibold z-10 relative">Settings</span>
                    <span className="text-xs text-gray-500 z-10 relative">Manage your account</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="civic-card mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest community contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">New report submitted</h4>
                      <p className="text-sm text-muted-foreground">Pothole on Main Street</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Pending</span>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Report resolved</h4>
                      <p className="text-sm text-muted-foreground">Broken streetlight fixed</p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Resolved</span>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Poll participation</h4>
                      <p className="text-sm text-muted-foreground">Community garden location</p>
                      <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Community Impact Section */}
          <div>
            <Card className="civic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <Award className="h-5 w-5" />
                  </div>
                  Community Impact
                </CardTitle>
                <CardDescription>Your contributions to the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <Award className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="font-bold text-lg">Community Hero</div>
                    <div className="text-sm text-muted-foreground">You&apos;ve reported 3 issues this month</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Heart className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-bold text-lg">Making a Difference</div>
                    <div className="text-sm text-muted-foreground">Your reports help 100+ neighbors</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="font-bold text-lg">Positive Impact</div>
                    <div className="text-sm text-muted-foreground">75% of your reports resolved</div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/impact'}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Impact Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Upcoming Events Preview */}
            <Card className="civic-card mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <h4 className="font-medium">Town Hall Meeting</h4>
                    <p className="text-sm text-muted-foreground">Thursday, 2:00 PM</p>
                    <p className="text-xs text-muted-foreground mt-1">Community Center</p>
                  </div>
                  
                  <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <h4 className="font-medium">Neighborhood Cleanup</h4>
                    <p className="text-sm text-muted-foreground">Saturday, 9:00 AM</p>
                    <p className="text-xs text-muted-foreground mt-1">Park Entrance</p>
                  </div>
                  
                  <Button variant="ghost" className="w-full justify-start text-primary" onClick={() => window.location.href = '/events'}>
                    View All Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Custom animation styles */}
    </div>
  )
}