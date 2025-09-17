"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Vote, Clock, Users, Filter, CheckCircle, XCircle, Calendar, Trash2 } from "lucide-react"

interface PollOption {
  id: string
  text: string
  votes: number
  voters: string[]
}

interface Poll {
  id: string
  title: string
  description: string
  creator: {
    id: string
    name: string
    avatar?: string
  }
  category: string
  options: PollOption[]
  totalVotes: number
  status: "active" | "closed" | "draft"
  isPublic: boolean
  allowMultipleVotes: boolean
  requiresAuth: boolean
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  hasVoted: boolean
  userVotes: string[]
}

interface PollCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

const pollCategories: PollCategory[] = [
  {
    id: "civic",
    name: "Civic Issues",
    description: "Local government and community decisions",
    color: "bg-blue-100 text-blue-800",
    icon: "🏛️",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Roads, utilities, and public works",
    color: "bg-orange-100 text-orange-800",
    icon: "🚧",
  },
  {
    id: "environment",
    name: "Environment",
    description: "Environmental and sustainability issues",
    color: "bg-green-100 text-green-800",
    icon: "🌱",
  },
  {
    id: "community",
    name: "Community",
    description: "Community events and social issues",
    color: "bg-purple-100 text-purple-800",
    icon: "👥",
  },
  {
    id: "budget",
    name: "Budget & Finance",
    description: "Municipal budget and spending priorities",
    color: "bg-yellow-100 text-yellow-800",
    icon: "💰",
  },
  {
    id: "general",
    name: "General",
    description: "General community questions and feedback",
    color: "bg-gray-100 text-gray-800",
    icon: "📊",
  },
]

const mockPolls: Poll[] = [
  {
    id: "1",
    title: "New Community Center Location",
    description:
      "The city is planning to build a new community center. Help us decide on the best location that would serve our residents most effectively.",
    creator: { id: "1", name: "City Planning Department" },
    category: "civic",
    options: [
      { id: "1", text: "Downtown District (near library)", votes: 45, voters: ["user1", "user2"] },
      { id: "2", text: "Riverside Park Area", votes: 32, voters: ["user3"] },
      { id: "3", text: "North Side Shopping Center", votes: 28, voters: ["user4", "user5"] },
      { id: "4", text: "South End Recreation Complex", votes: 19, voters: [] },
    ],
    totalVotes: 124,
    status: "active",
    isPublic: true,
    allowMultipleVotes: false,
    requiresAuth: true,
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-02-15T23:59:59Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    tags: ["community-center", "location", "planning"],
    hasVoted: false,
    userVotes: [],
  },
  {
    id: "2",
    title: "Street Lighting Improvement Priority",
    description:
      "We have budget to improve street lighting in two neighborhoods this year. Which areas should we prioritize?",
    creator: { id: "2", name: "Public Works Department" },
    category: "infrastructure",
    options: [
      { id: "1", text: "Oak Street Residential Area", votes: 67, voters: ["user1", "user6"] },
      { id: "2", text: "Main Street Business District", votes: 54, voters: ["user2", "user7"] },
      { id: "3", text: "Park Avenue School Zone", votes: 89, voters: ["user3", "user8", "user9"] },
      { id: "4", text: "Elm Street Senior Housing", votes: 43, voters: ["user4"] },
    ],
    totalVotes: 253,
    status: "active",
    isPublic: true,
    allowMultipleVotes: true,
    requiresAuth: true,
    startDate: "2024-01-10T00:00:00Z",
    endDate: "2024-01-31T23:59:59Z",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-22T11:15:00Z",
    tags: ["lighting", "safety", "infrastructure"],
    hasVoted: true,
    userVotes: ["1", "3"],
  },
  {
    id: "3",
    title: "Community Garden Expansion",
    description: "Should we expand the existing community garden or create a new one in a different location?",
    creator: { id: "3", name: "Sarah Johnson" },
    category: "environment",
    options: [
      { id: "1", text: "Expand current garden at Riverside Park", votes: 78, voters: ["user1", "user2", "user3"] },
      { id: "2", text: "Create new garden in North District", votes: 45, voters: ["user4", "user5"] },
      { id: "3", text: "Both - expand and create new", votes: 92, voters: ["user6", "user7", "user8", "user9"] },
      { id: "4", text: "Focus resources elsewhere", votes: 12, voters: ["user10"] },
    ],
    totalVotes: 227,
    status: "closed",
    isPublic: true,
    allowMultipleVotes: false,
    requiresAuth: true,
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-01-20T23:59:59Z",
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-20T23:59:59Z",
    tags: ["garden", "environment", "expansion"],
    hasVoted: true,
    userVotes: ["3"],
  },
]

export default function VotingPage() {
  const [polls, setPolls] = useState<Poll[]>(mockPolls)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false)
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    category: "",
    options: ["", ""],
    endDate: "",
    allowMultipleVotes: false,
    tags: "",
  })
  const { user } = useAuth()
  const { toast } = useToast()

  const filteredPolls = polls.filter((poll) => {
    const matchesSearch =
      poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || poll.category === categoryFilter
    const matchesStatus = statusFilter === "all" || poll.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreatePoll = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create polls.",
        variant: "destructive",
      })
      return
    }

    if (
      !newPoll.title.trim() ||
      !newPoll.description.trim() ||
      !newPoll.category ||
      newPoll.options.filter((opt) => opt.trim()).length < 2
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and provide at least 2 options.",
        variant: "destructive",
      })
      return
    }

    const poll: Poll = {
      id: Date.now().toString(),
      title: newPoll.title,
      description: newPoll.description,
      creator: { id: user.id, name: user.name },
      category: newPoll.category,
      options: newPoll.options
        .filter((opt) => opt.trim())
        .map((opt, index) => ({
          id: (index + 1).toString(),
          text: opt.trim(),
          votes: 0,
          voters: [],
        })),
      totalVotes: 0,
      status: "active",
      isPublic: true,
      allowMultipleVotes: newPoll.allowMultipleVotes,
      requiresAuth: true,
      startDate: new Date().toISOString(),
      endDate: newPoll.endDate ? new Date(newPoll.endDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newPoll.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      hasVoted: false,
      userVotes: [],
    }

    setPolls((prev) => [poll, ...prev])
    setNewPoll({
      title: "",
      description: "",
      category: "",
      options: ["", ""],
      endDate: "",
      allowMultipleVotes: false,
      tags: "",
    })
    setIsCreatePollOpen(false)

    toast({
      title: "Poll Created!",
      description: "Your poll has been published and is now accepting votes.",
    })
  }

  const handleVote = (pollId: string, optionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote.",
        variant: "destructive",
      })
      return
    }

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          if (poll.status !== "active") {
            toast({
              title: "Poll Closed",
              description: "This poll is no longer accepting votes.",
              variant: "destructive",
            })
            return poll
          }

          const hasVotedForOption = poll.userVotes.includes(optionId)
          const hasVotedAtAll = poll.hasVoted

          if (!poll.allowMultipleVotes && hasVotedAtAll && !hasVotedForOption) {
            toast({
              title: "Already Voted",
              description: "You can only vote once in this poll.",
              variant: "destructive",
            })
            return poll
          }

          let newUserVotes: string[]
          let newOptions: PollOption[]

          if (hasVotedForOption) {
            // Remove vote
            newUserVotes = poll.userVotes.filter((id) => id !== optionId)
            newOptions = poll.options.map((option) =>
              option.id === optionId
                ? {
                    ...option,
                    votes: option.votes - 1,
                    voters: option.voters.filter((voterId) => voterId !== user.id),
                  }
                : option,
            )
          } else {
            // Add vote
            if (poll.allowMultipleVotes) {
              newUserVotes = [...poll.userVotes, optionId]
            } else {
              // Single vote - remove previous vote if exists
              newUserVotes = [optionId]
              newOptions = poll.options.map((option) => {
                if (poll.userVotes.includes(option.id)) {
                  // Remove previous vote
                  return {
                    ...option,
                    votes: option.votes - 1,
                    voters: option.voters.filter((voterId) => voterId !== user.id),
                  }
                } else if (option.id === optionId) {
                  // Add new vote
                  return {
                    ...option,
                    votes: option.votes + 1,
                    voters: [...option.voters, user.id],
                  }
                }
                return option
              })
            }

            if (poll.allowMultipleVotes) {
              newOptions = poll.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      votes: option.votes + 1,
                      voters: [...option.voters, user.id],
                    }
                  : option,
              )
            }
          }

          const newTotalVotes = newOptions.reduce((sum, option) => sum + option.votes, 0)

          return {
            ...poll,
            options: newOptions,
            totalVotes: newTotalVotes,
            hasVoted: newUserVotes.length > 0,
            userVotes: newUserVotes,
          }
        }
        return poll
      }),
    )

    toast({
      title: "Vote Recorded!",
      description: "Thank you for participating in the community poll.",
    })
  }

  const addPollOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }))
    }
  }

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  const getCategoryInfo = (categoryId: string) => {
    return (
      pollCategories.find((cat) => cat.id === categoryId) || {
        name: categoryId,
        color: "bg-gray-100 text-gray-800",
        icon: "📊",
      }
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`
    return "Less than 1 hour left"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-civic-text mb-4 text-balance">Community Voting</h1>
          <p className="text-lg text-civic-text/80 max-w-2xl text-pretty">
            Participate in community decisions and make your voice heard. Vote on local issues, initiatives, and
            proposals that shape our neighborhood.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={isCreatePollOpen} onOpenChange={setIsCreatePollOpen}>
            <DialogTrigger asChild>
              <Button className="bg-civic-primary hover:bg-civic-accent text-white font-medium px-6 py-3 h-auto">
                <Plus className="h-5 w-5 mr-2" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-civic-text">Create Community Poll</DialogTitle>
                <DialogDescription className="text-civic-text/70">
                  Create a poll to gather community input on important decisions and issues.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Poll Title *</Label>
                  <Input
                    id="title"
                    placeholder="What would you like to ask the community?"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newPoll.category}
                    onValueChange={(value) => setNewPoll((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select poll category" />
                    </SelectTrigger>
                    <SelectContent>
                      {pollCategories.map((category) => (
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
                    placeholder="Provide context and details about this poll..."
                    value={newPoll.description}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Poll Options *</Label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          className="flex-1"
                        />
                        {newPoll.options.length > 2 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removePollOption(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {newPoll.options.length < 6 && (
                      <Button type="button" variant="outline" onClick={addPollOption} className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={newPoll.endDate}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Separate tags with commas"
                    value={newPoll.tags}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowMultiple"
                    checked={newPoll.allowMultipleVotes}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, allowMultipleVotes: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="allowMultiple">Allow multiple votes per person</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatePollOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePoll}
                    className="flex-1 bg-civic-primary hover:bg-civic-accent text-white"
                  >
                    Create Poll
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                    placeholder="Search polls..."
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
                    {pollCategories.map((category) => (
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
                    <SelectValue placeholder="All polls" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Polls</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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

        {/* Polls List */}
        <div className="space-y-6">
          {filteredPolls.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No polls found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || categoryFilter !== "all" || statusFilter !== "active"
                    ? "Try adjusting your filters or search terms."
                    : "Be the first to create a poll for the community."}
                </p>
                <Dialog open={isCreatePollOpen} onOpenChange={setIsCreatePollOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-civic-primary hover:bg-civic-accent text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Poll
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            filteredPolls.map((poll) => {
              const categoryInfo = getCategoryInfo(poll.category)
              return (
                <Card key={poll.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{categoryInfo.icon}</span>
                          <Badge className={categoryInfo.color}>{categoryInfo.name}</Badge>
                          {poll.status === "active" ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Closed
                            </Badge>
                          )}
                          {poll.allowMultipleVotes && (
                            <Badge variant="outline" className="text-xs">
                              Multiple votes allowed
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-civic-text mb-2">{poll.title}</CardTitle>
                        <p className="text-civic-text/70 mb-4">{poll.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-civic-text/60">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-civic-primary text-white text-xs">
                            {poll.creator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>by {poll.creator.name}</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(poll.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {poll.totalVotes} votes
                      </span>
                      {poll.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeRemaining(poll.endDate)}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {poll.options.map((option) => {
                        const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
                        const isUserVote = poll.userVotes.includes(option.id)

                        return (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Button
                                variant={isUserVote ? "default" : "outline"}
                                onClick={() => handleVote(poll.id, option.id)}
                                disabled={poll.status !== "active"}
                                className={`flex-1 justify-start text-left h-auto p-3 ${
                                  isUserVote
                                    ? "bg-civic-primary hover:bg-civic-accent text-white"
                                    : "bg-transparent hover:bg-civic-background/50"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">{option.text}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {option.votes} vote{option.votes !== 1 ? "s" : ""}
                                    </span>
                                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </Button>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>

                    {poll.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t">
                        {poll.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {poll.hasVoted && (
                      <div className="mt-4 p-3 bg-civic-background/30 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-civic-text/80">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>
                            You voted for:{" "}
                            {poll.userVotes
                              .map((voteId) => poll.options.find((opt) => opt.id === voteId)?.text)
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
