"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "../../../../components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Flag, Pin, Lock, Eye, Clock } from "lucide-react"

interface Reply {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  likeCount: number
  isLiked: boolean
}

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
  isLiked: boolean
  replies: Reply[]
  status: "active" | "closed" | "archived"
}

export default function ForumPostPage() {
  const params = useParams()
  // const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [newReply, setNewReply] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockPost: ForumPost = {
      id: params.id as string,
      title: "New Community Garden Initiative - Need Volunteers!",
      content: `We're starting a new community garden in Riverside Park and looking for volunteers to help with planning and maintenance.

The garden will feature:
- Vegetable plots for community members
- Native plant sections
- Composting area
- Tool storage shed
- Educational signage

We need help with:
- Site preparation and soil testing
- Building raised beds
- Installing irrigation system
- Creating pathways
- Ongoing maintenance

If you're interested in getting involved, please reply to this post or contact me directly. We're planning to start work next month and would love to have a diverse group of community members involved.

This is a great opportunity to:
- Learn about sustainable gardening
- Meet your neighbors
- Contribute to community beautification
- Access fresh, locally grown produce

Looking forward to working together to make this vision a reality!`,
      author: { id: "1", name: "Sarah Johnson" },
      category: "environment",
      tags: ["gardening", "volunteers", "parks"],
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      isPinned: true,
      isLocked: false,
      viewCount: 234,
      likeCount: 18,
      isLiked: false,
      replies: [
        {
          id: "1",
          content:
            "This sounds amazing! I'd love to help with the site preparation. I have some experience with soil testing from my previous work.",
          author: { id: "2", name: "Mike Chen" },
          createdAt: "2024-01-15T14:20:00Z",
          likeCount: 5,
          isLiked: false,
        },
        {
          id: "2",
          content: "Count me in! I can help with building the raised beds. I have tools and some carpentry experience.",
          author: { id: "3", name: "Lisa Martinez" },
          createdAt: "2024-01-15T16:45:00Z",
          likeCount: 3,
          isLiked: false,
        },
        {
          id: "3",
          content:
            "Great initiative! I work for the Parks Department and can help coordinate with the city for permits and water access.",
          author: { id: "4", name: "Tom Wilson" },
          createdAt: "2024-01-16T09:15:00Z",
          likeCount: 8,
          isLiked: false,
        },
      ],
      status: "active",
    }

    setPost(mockPost)
    setIsLoading(false)
  }, [params.id])

  const handleLikePost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      })
      return
    }

    if (post) {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
            }
          : null,
      )
    }
  }

  const handleReply = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply.",
        variant: "destructive",
      })
      return
    }

    if (!newReply.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please write something before posting.",
        variant: "destructive",
      })
      return
    }

    const reply: Reply = {
      id: Date.now().toString(),
      content: newReply,
      author: { id: user.id, name: user.name },
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
    }

    if (post) {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              replies: [...prev.replies, reply],
            }
          : null,
      )
    }

    setNewReply("")
    toast({
      title: "Reply Posted!",
      description: "Your reply has been added to the discussion.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-civic-text mb-4">Post Not Found</h1>
            <p className="text-civic-text/70 mb-6">The discussion you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/forums">
              <Button className="bg-civic-primary hover:bg-civic-accent text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forums
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-background via-white to-civic-background/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/forums">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forums
          </Button>
        </Link>

        {/* Main Post */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              {post.isPinned && <Pin className="h-5 w-5 text-civic-accent" />}
              {post.isLocked && <Lock className="h-5 w-5 text-gray-500" />}
              <h1 className="text-2xl font-bold text-civic-text flex-1">{post.title}</h1>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-green-100 text-green-800">{post.category}</Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-civic-text/60">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-civic-primary text-white">
                    {post.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount} views
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-civic-text whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant={post.isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLikePost}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                {post.likeCount}
              </Button>

              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <MessageCircle className="h-4 w-4" />
                {post.replies.length} replies
              </Button>

              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              <Button variant="outline" size="sm" className="flex items-center gap-2 ml-auto bg-transparent">
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-civic-text">Replies ({post.replies.length})</h2>

          {post.replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-civic-primary text-white">
                      {reply.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-civic-text">{reply.author.name}</span>
                      <span className="text-sm text-civic-text/60">{formatDate(reply.createdAt)}</span>
                    </div>

                    <p className="text-civic-text mb-3">{reply.content}</p>

                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <ThumbsUp className="h-3 w-3" />
                      {reply.likeCount}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {!post.isLocked && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-civic-text mb-4">Add a Reply</h3>

              {user ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="min-h-[100px]"
                  />

                  <div className="flex gap-3">
                    <Button onClick={handleReply} className="bg-civic-primary hover:bg-civic-accent text-white">
                      Post Reply
                    </Button>
                    <Button variant="outline" onClick={() => setNewReply("")}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-civic-text/70 mb-4">Please sign in to join the discussion.</p>
                  <Link href="/login">
                    <Button className="bg-civic-primary hover:bg-civic-accent text-white">Sign In</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
