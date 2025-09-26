"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "../../lib/auth"
import { useToast } from "../../hooks/use-toast"
import { Plus, Search, MessageSquare, Pin, Lock, Eye, ThumbsUp, MessageCircle, Filter } from "lucide-react"

interface ForumPost {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  likeCount: number
  replyCount: number
  lastReply?: {
    author: string
    createdAt: string
  }
  status: "active" | "closed" | "archived"
}

interface ForumCategory {
  id: string
  name: string
  description: string
  postCount: number
  color: string
}

const mockCategories: ForumCategory[] = [
  {
    id: "general",
    name: "General Discussion",
    description: "Community conversations and announcements",
    postCount: 45,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Roads, utilities, and public works",
    postCount: 23,
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "safety",
    name: "Public Safety",
    description: "Safety concerns and community watch",
    postCount: 18,
    color: "bg-red-100 text-red-800",
  },
  {
    id: "environment",
    name: "Environment",
    description: "Parks, recycling, and green initiatives",
    postCount: 31,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "events",
    name: "Community Events",
    description: "Local events and gatherings",
    postCount: 12,
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "suggestions",
    name: "Suggestions",
    description: "Ideas for community improvement",
    postCount: 27,
    color: "bg-yellow-100 text-yellow-800",
  },
]

const mockPosts: ForumPost[] = [
  {
    id: "1",
    title: "New Community Garden Initiative - Need Volunteers!",
    content:
      "We're starting a new community garden in Riverside Park and looking for volunteers to help with planning and maintenance...",
    author: { id: "1", name: "Sarah Johnson" },
    category: "environment",
    tags: ["gardening", "volunteers", "parks"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    isPinned: true,
    isLocked: false,
    viewCount: 234,
    likeCount: 18,
    replyCount: 12,
    lastReply: { author: "Mike Chen", createdAt: "2024-01-16T14:20:00Z" },
    status: "active",
  },
  {
    id: "2",
    title: "Pothole on Main Street - When will it be fixed?",
    content:
      "There's a large pothole on Main Street near the library that's been there for weeks. It's becoming a safety hazard...",
    author: { id: "2", name: "Robert Davis" },
    category: "infrastructure",
    tags: ["roads", "maintenance", "safety"],
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    isPinned: false,
    isLocked: false,
    viewCount: 156,
    likeCount: 8,
    replyCount: 5,
    lastReply: { author: "City Admin", createdAt: "2024-01-15T09:15:00Z" },
    status: "active",
  },
  {
    id: "3",
    title: "Neighborhood Watch Meeting - January 20th",
    content:
      "Join us for our monthly neighborhood watch meeting to discuss recent safety concerns and community initiatives...",
    author: { id: "3", name: "Lisa Martinez" },
    category: "safety",
    tags: ["meeting", "safety", "community"],
    createdAt: "2024-01-13T12:00:00Z",
    updatedAt: "2024-01-13T12:00:00Z",
    isPinned: false,
    isLocked: false,
    viewCount: 89,
    likeCount: 15,
    replyCount: 3,
    lastReply: { author: "Tom Wilson", createdAt: "2024-01-14T08:30:00Z" },
    status: "active",
  },
]

export default function ForumsPage() {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts)
  const [categories] = useState<ForumCategory[]>(mockCategories)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  })
  const { user } = useAuth()
  const { toast } = useToast()

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case "popular":
        return b.likeCount - a.likeCount
      case "replies":
        return b.replyCount - a.replyCount
      default:
        return 0
    }
  })

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a post.",
        variant: "destructive",
      })
      return
    }

    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: { id: user.id, name: user.name },
      category: newPost.category,
      tags: newPost.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      likeCount: 0,
      replyCount: 0,
      status: "active",
    }

    setPosts((prev) => [post, ...prev])
    setNewPost({ title: "", content: "", category: "", tags: "" })
    setIsCreatePostOpen(false)

    toast({
      title: "Post Created!",
      description: "Your post has been published to the community forum.",
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || { name: categoryId, color: "bg-gray-100 text-gray-800" }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
      <div className="container mx-auto px-4 py-8 md:pl-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-civic-text mb-4 text-balance">Community Forums</h1>
          <p className="text-lg text-civic-text/80 max-w-2xl text-pretty">
            Connect with your neighbors, discuss community issues, and share ideas to make our city better together.
          </p>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={category.color}>{category.name}</Badge>
                  <span className="text-sm text-civic-text/60">{category.postCount} posts</span>
                </div>
                <p className="text-sm text-civic-text/70">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
            <DialogTrigger asChild>
              <Button className="bg-civic-primary hover:bg-civic-accent text-white font-medium px-6 py-3 h-auto">
                <Plus className="h-5 w-5 mr-2" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-civic-text">Start a New Discussion</DialogTitle>
                <DialogDescription className="text-civic-text/70">
                  Share your thoughts, ask questions, or start a conversation with the community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="What would you like to discuss?"
                    value={newPost.title}
                    onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts..."
                    value={newPost.content}
                    onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    placeholder="Separate tags with commas"
                    value={newPost.tags}
                    onChange={(e) => setNewPost((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatePostOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    className="flex-1 bg-civic-primary hover:bg-civic-accent text-white"
                  >
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="replies">Most Replies</SelectItem>
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

        {/* Posts List */}
        <div className="space-y-4">
          {sortedPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filters."
                    : "Be the first to start a discussion in this community."}
                </p>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-civic-primary hover:bg-civic-accent text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Discussion
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            sortedPosts.map((post) => {
              const categoryInfo = getCategoryInfo(post.category)
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-civic-primary text-white">
                          {post.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-civic-accent" />}
                          {post.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                          <Link href={`/forums/post/${post.id}`} className="hover:underline">
                            <h3 className="text-lg font-semibold text-civic-text line-clamp-1">{post.title}</h3>
                          </Link>
                        </div>

                        <p className="text-civic-text/70 mb-3 line-clamp-2">{post.content}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={categoryInfo.color}>{categoryInfo.name}</Badge>
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-civic-text/60">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.replyCount}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span>by {post.author.name}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                            {post.lastReply && (
                              <>
                                <span>•</span>
                                <span>last reply by {post.lastReply.author}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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