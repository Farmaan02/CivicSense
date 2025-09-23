"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  CalendarIcon,
  MapPin,
  Clock,
  Users,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface CommunityEvent {
  id: string
  title: string
  description: string
  organizer: {
    id: string
    name: string
    avatar?: string
  }
  category: string
  date: string
  startTime: string
  endTime: string
  location: {
    name: string
    address: string
    coordinates?: { lat: number; lng: number }
  }
  maxAttendees?: number
  currentAttendees: number
  attendees: Array<{
    id: string
    name: string
    avatar?: string
  }>
  isPublic: boolean
  requiresApproval: boolean
  tags: string[]
  imageUrl?: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

interface EventCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

const eventCategories: EventCategory[] = [
  {
    id: "meeting",
    name: "Community Meeting",
    description: "Town halls, council meetings, and public forums",
    color: "bg-blue-100 text-blue-800",
    icon: "🏛️",
  },
  {
    id: "cleanup",
    name: "Cleanup & Maintenance",
    description: "Community cleanup events and maintenance activities",
    color: "bg-green-100 text-green-800",
    icon: "🧹",
  },
  {
    id: "social",
    name: "Social Event",
    description: "Community gatherings, festivals, and celebrations",
    color: "bg-purple-100 text-purple-800",
    icon: "🎉",
  },
  {
    id: "education",
    name: "Educational",
    description: "Workshops, seminars, and learning opportunities",
    color: "bg-orange-100 text-orange-800",
    icon: "📚",
  },
  {
    id: "volunteer",
    name: "Volunteer Work",
    description: "Community service and volunteer opportunities",
    color: "bg-red-100 text-red-800",
    icon: "🤝",
  },
  {
    id: "sports",
    name: "Sports & Recreation",
    description: "Sports events, fitness activities, and recreation",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⚽",
  },
]

const mockEvents: CommunityEvent[] = [
  {
    id: "1",
    title: "Monthly Town Hall Meeting",
    description:
      "Join us for our monthly town hall meeting to discuss community issues, upcoming projects, and hear from local officials. All residents are welcome to attend and participate in the Q&A session.",
    organizer: { id: "1", name: "City Council" },
    category: "meeting",
    date: "2024-02-15",
    startTime: "19:00",
    endTime: "21:00",
    location: {
      name: "Community Center",
      address: "123 Main Street, Downtown",
    },
    maxAttendees: 200,
    currentAttendees: 45,
    attendees: [
      { id: "1", name: "Sarah Johnson" },
      { id: "2", name: "Mike Chen" },
      { id: "3", name: "Lisa Martinez" },
    ],
    isPublic: true,
    requiresApproval: false,
    tags: ["town-hall", "community", "government"],
    status: "upcoming",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Riverside Park Cleanup Day",
    description:
      "Help us keep our beautiful Riverside Park clean and green! We'll provide all supplies including gloves, trash bags, and tools. Refreshments will be provided for all volunteers.",
    organizer: { id: "2", name: "Green Community Initiative" },
    category: "cleanup",
    date: "2024-02-10",
    startTime: "09:00",
    endTime: "12:00",
    location: {
      name: "Riverside Park",
      address: "456 River Road, Riverside District",
    },
    maxAttendees: 50,
    currentAttendees: 23,
    attendees: [
      { id: "4", name: "Tom Wilson" },
      { id: "5", name: "Emma Davis" },
    ],
    isPublic: true,
    requiresApproval: false,
    tags: ["cleanup", "environment", "volunteer"],
    status: "upcoming",
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
  },
  {
    id: "3",
    title: "Community Garden Workshop",
    description:
      "Learn the basics of community gardening, composting, and sustainable growing practices. Perfect for beginners and experienced gardeners alike. Seeds and starter plants will be provided.",
    organizer: { id: "3", name: "Sarah Johnson" },
    category: "education",
    date: "2024-02-20",
    startTime: "14:00",
    endTime: "16:30",
    location: {
      name: "Community Garden",
      address: "789 Garden Lane, Riverside Park",
    },
    maxAttendees: 25,
    currentAttendees: 18,
    attendees: [
      { id: "6", name: "Robert Brown" },
      { id: "7", name: "Jennifer Lee" },
    ],
    isPublic: true,
    requiresApproval: false,
    tags: ["gardening", "education", "sustainability"],
    status: "upcoming",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>(mockEvents)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("upcoming")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    locationName: "",
    locationAddress: "",
    maxAttendees: "",
    tags: "",
    isPublic: true,
    requiresApproval: false,
  })
  const { user } = useAuth()
  const { toast } = useToast()

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreateEvent = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create events.",
        variant: "destructive",
      })
      return
    }

    if (
      !newEvent.title.trim() ||
      !newEvent.description.trim() ||
      !newEvent.category ||
      !newEvent.date ||
      !newEvent.startTime ||
      !newEvent.locationName.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const event: CommunityEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      organizer: { id: user.id, name: user.name },
      category: newEvent.category,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime || newEvent.startTime,
      location: {
        name: newEvent.locationName,
        address: newEvent.locationAddress,
      },
      maxAttendees: newEvent.maxAttendees ? Number.parseInt(newEvent.maxAttendees) : undefined,
      currentAttendees: 0,
      attendees: [],
      isPublic: newEvent.isPublic,
      requiresApproval: newEvent.requiresApproval,
      tags: newEvent.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status: "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setEvents((prev) => [event, ...prev])
    setNewEvent({
      title: "",
      description: "",
      category: "",
      date: "",
      startTime: "",
      endTime: "",
      locationName: "",
      locationAddress: "",
      maxAttendees: "",
      tags: "",
      isPublic: true,
      requiresApproval: false,
    })
    setIsCreateEventOpen(false)

    toast({
      title: "Event Created!",
      description: "Your event has been published to the community calendar.",
    })
  }

  const handleRSVP = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to RSVP for events.",
        variant: "destructive",
      })
      return
    }

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          const isAlreadyAttending = event.attendees.some((attendee) => attendee.id === user.id)
          if (isAlreadyAttending) {
            return {
              ...event,
              attendees: event.attendees.filter((attendee) => attendee.id !== user.id),
              currentAttendees: event.currentAttendees - 1,
            }
          } else {
            if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
              toast({
                title: "Event Full",
                description: "This event has reached maximum capacity.",
                variant: "destructive",
              })
              return event
            }
            return {
              ...event,
              attendees: [...event.attendees, { id: user.id, name: user.name }],
              currentAttendees: event.currentAttendees + 1,
            }
          }
        }
        return event
      }),
    )

    toast({
      title: "RSVP Updated!",
      description: "Your attendance status has been updated.",
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return (
      eventCategories.find((cat) => cat.id === categoryId) || {
        name: categoryId,
        color: "bg-gray-100 text-gray-800",
        icon: "📅",
      }
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const isUserAttending = (event: CommunityEvent) => {
    return user && event.attendees.some((attendee) => attendee.id === user.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
      <div className="container mx-auto px-4 py-8 md:pl-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-civic-text mb-4 text-balance">Community Events</h1>
          <p className="text-lg text-civic-text/80 max-w-2xl text-pretty">
            Discover and participate in local events, meetings, and activities that bring our community together.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button className="bg-civic-primary hover:bg-civic-accent text-white font-medium px-6 py-3 h-auto">
                <Plus className="h-5 w-5 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-civic-text">Create Community Event</DialogTitle>
                <DialogDescription className="text-civic-text/70">
                  Organize an event to bring the community together. All events are subject to community guidelines.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="What's your event about?"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="locationName">Location Name *</Label>
                  <Input
                    id="locationName"
                    placeholder="Community Center, Park, etc."
                    value={newEvent.locationName}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, locationName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="locationAddress">Address</Label>
                  <Input
                    id="locationAddress"
                    placeholder="Street address"
                    value={newEvent.locationAddress}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, locationAddress: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, maxAttendees: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Separate tags with commas"
                    value={newEvent.tags}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateEventOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    className="flex-1 bg-civic-primary hover:bg-civic-accent text-white"
                  >
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {eventCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === "calendar" ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-civic-text">Event Calendar</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">February 2024</span>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredEvents.length === 0 ? (
              <Card className={viewMode === "grid" ? "col-span-full" : ""}>
                <CardContent className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || categoryFilter !== "all" || statusFilter !== "upcoming"
                      ? "Try adjusting your filters or search terms."
                      : "Be the first to create an event in your community."}
                  </p>
                  <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-civic-primary hover:bg-civic-accent text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => {
                const categoryInfo = getCategoryInfo(event.category)
                const isAttending = isUserAttending(event)
                const isFull = event.maxAttendees && event.currentAttendees >= event.maxAttendees

                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{categoryInfo.icon}</span>
                            <Badge className={categoryInfo.color}>{categoryInfo.name}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-civic-text mb-2 line-clamp-2">{event.title}</h3>
                        </div>
                      </div>

                      <p className="text-civic-text/70 mb-4 line-clamp-3">{event.description}</p>

                      <div className="space-y-2 mb-4 text-sm text-civic-text/80">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.startTime)}
                            {event.endTime && event.endTime !== event.startTime && ` - ${formatTime(event.endTime)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.currentAttendees} attending
                            {event.maxAttendees && ` / ${event.maxAttendees} max`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-civic-primary text-white text-xs">
                              {event.organizer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-civic-text/60">by {event.organizer.name}</span>
                        </div>

                        <Button
                          onClick={() => handleRSVP(event.id)}
                          variant={isAttending ? "default" : "outline"}
                          size="sm"
                          disabled={!!(!isAttending && isFull)}
                          className={
                            isAttending ? "bg-civic-primary hover:bg-civic-accent text-white" : "bg-transparent"
                          }
                        >
                          {isAttending ? "Attending" : isFull ? "Full" : "RSVP"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}