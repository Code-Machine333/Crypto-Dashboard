"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar,
  User,
  Tag,
  Copy,
  ExternalLink
} from "lucide-react"

interface SharedWidgetData {
  id: string
  name: string
  description?: string
  widgetType: string
  config: Record<string, any>
  isPublic: boolean
  shareToken: string
  viewCount: number
  likeCount: number
  tags?: string[]
  owner: {
    id: string
    email: string
    name?: string
  }
  collaborators?: Array<{
    id: string
    role: string
    permissions: string[]
    user: {
      id: string
      email: string
      name?: string
    }
  }>
  comments?: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      email: string
      name?: string
    }
    replies?: Array<{
      id: string
      content: string
      createdAt: string
      user: {
        id: string
        email: string
        name?: string
      }
    }>
  }>
  createdAt: string
  updatedAt: string
}

export default function SharedWidgetPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [widget, setWidget] = useState<SharedWidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (params.token) {
      fetchWidget()
    }
  }, [params.token])

  const fetchWidget = async () => {
    try {
      const res = await fetch(`/api/shared-widgets/token/${params.token}`)
      const data = await res.json()
      
      if (data.ok) {
        setWidget(data.data)
      } else {
        setError(data.error || "Widget not found")
      }
    } catch (error) {
      setError("Failed to load widget")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!widget) return
    
    try {
      await fetch(`/api/shared-widgets/${widget.id}/like`, {
        method: 'POST',
      })
      
      setWidget(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null)
    } catch (error) {
      console.error('Failed to like widget:', error)
    }
  }

  const handleAddComment = async () => {
    if (!widget || !newComment.trim()) return
    
    setSubmittingComment(true)
    try {
      await fetch(`/api/shared-widgets/${widget.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })
      
      setNewComment("")
      fetchWidget() // Refresh to get new comments
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const copyShareLink = () => {
    if (widget) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${widget.shareToken}`)
    }
  }

  const openWidget = () => {
    if (widget) {
      const config = btoa(JSON.stringify(widget.config))
      window.open(`/widget/${widget.widgetType}?cfg=${config}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <div className="text-white">Loading widget...</div>
      </div>
    )
  }

  if (error || !widget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Widget Not Found
            </CardTitle>
            <CardDescription>
              {error || "This widget may have been removed or made private"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
                {widget.name}
              </h1>
              {widget.description && (
                <p className="text-gray-400 text-lg">{widget.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyShareLink}
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={openWidget}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Widget
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {widget.viewCount} views
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {widget.likeCount} likes
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {widget.comments?.length || 0} comments
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(widget.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Widget Preview */}
            <Card className="bg-black/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-orange-500" />
                  Widget Preview
                </CardTitle>
                <CardDescription>
                  {widget.widgetType} widget by {widget.owner.name || widget.owner.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Share2 className="w-8 h-8 text-orange-500" />
                    </div>
                    <p>Widget preview would be rendered here</p>
                    <p className="text-sm mt-2">Click "Open Widget" to view the live widget</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="bg-black/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-orange-500" />
                  Comments ({widget.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                {session && (
                  <div className="space-y-2">
                    <Label className="text-white">Add a comment</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="bg-black/50 border-gray-700 text-white"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || submittingComment}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {submittingComment ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {widget.comments?.map(comment => (
                    <div key={comment.id} className="border-l-2 border-orange-500/30 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-white">
                          {comment.user.name || comment.user.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="border-l-2 border-gray-600 pl-3">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-3 h-3 text-gray-500" />
                                <span className="text-xs font-medium text-gray-400">
                                  {reply.user.name || reply.user.email}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {(!widget.comments || widget.comments.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to share your thoughts!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="bg-black/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleLike}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like ({widget.likeCount})
                </Button>
                <Button
                  onClick={copyShareLink}
                  variant="outline"
                  className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Widget Info */}
            <Card className="bg-black/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white">Widget Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-gray-400 text-sm">Type</Label>
                  <p className="text-white">{widget.widgetType}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Owner</Label>
                  <p className="text-white">{widget.owner.name || widget.owner.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Created</Label>
                  <p className="text-white">{new Date(widget.createdAt).toLocaleDateString()}</p>
                </div>
                {widget.tags && widget.tags.length > 0 && (
                  <div>
                    <Label className="text-gray-400 text-sm">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {widget.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collaborators */}
            {widget.collaborators && widget.collaborators.length > 0 && (
              <Card className="bg-black/50 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Collaborators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {widget.collaborators.map(collab => (
                      <div key={collab.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-white">
                            {collab.user.name || collab.user.email}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">
                          {collab.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
