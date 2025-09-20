"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Heart, 
  Eye, 
  MessageCircle, 
  Calendar,
  User,
  Tag,
  Share2,
  Filter,
  TrendingUp
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
  createdAt: string
  updatedAt: string
}

const WIDGET_TYPES = [
  'market-cap',
  'donations',
  'buy-bot',
  'chat-widget',
  'subathon-timer',
  'burn-goals'
]

export default function CommunityPage() {
  const { data: session } = useSession()
  const [widgets, setWidgets] = useState<SharedWidgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [sortBy, setSortBy] = useState<"views" | "likes" | "recent">("views")

  useEffect(() => {
    fetchWidgets()
  }, [search, selectedType, sortBy])

  const fetchWidgets = async () => {
    try {
      const params = new URLSearchParams({
        type: "public",
        limit: "20",
        ...(search && { search }),
        ...(selectedType && { widgetType: selectedType }),
      })

      const res = await fetch(`/api/shared-widgets?${params}`)
      const data = await res.json()
      
      if (data.ok) {
        let sortedWidgets = data.data

        // Sort widgets
        switch (sortBy) {
          case "views":
            sortedWidgets = sortedWidgets.sort((a: SharedWidgetData, b: SharedWidgetData) => b.viewCount - a.viewCount)
            break
          case "likes":
            sortedWidgets = sortedWidgets.sort((a: SharedWidgetData, b: SharedWidgetData) => b.likeCount - a.likeCount)
            break
          case "recent":
            sortedWidgets = sortedWidgets.sort((a: SharedWidgetData, b: SharedWidgetData) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            break
        }

        setWidgets(sortedWidgets)
      }
    } catch (error) {
      console.error('Failed to fetch widgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (widgetId: string) => {
    try {
      await fetch(`/api/shared-widgets/${widgetId}/like`, {
        method: 'POST',
      })
      
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? { ...w, likeCount: w.likeCount + 1 } : w
      ))
    } catch (error) {
      console.error('Failed to like widget:', error)
    }
  }

  const openWidget = (widget: SharedWidgetData) => {
    const config = btoa(JSON.stringify(widget.config))
    window.open(`/widget/${widget.widgetType}?cfg=${config}`, '_blank')
  }

  const openSharedPage = (widget: SharedWidgetData) => {
    window.open(`/shared/${widget.shareToken}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <div className="text-white">Loading community widgets...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
            Community Widgets
          </h1>
          <p className="text-gray-400">Discover and share amazing crypto dashboard widgets</p>
        </div>

        {/* Filters */}
        <Card className="bg-black/50 border-orange-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search widgets..."
                    className="pl-10 bg-black/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Widget Type Filter */}
              <div className="md:w-48">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md text-white"
                >
                  <option value="">All Types</option>
                  {WIDGET_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="md:w-32">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "views" | "likes" | "recent")}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md text-white"
                >
                  <option value="views">Most Views</option>
                  <option value="likes">Most Liked</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widgets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map(widget => (
            <Card key={widget.id} className="bg-black/50 border-orange-500/30 hover:border-orange-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-1">{widget.name}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {widget.description || "No description"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" />
                    {widget.widgetType}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {widget.viewCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {widget.likeCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(widget.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-300">
                    {widget.owner.name || widget.owner.email}
                  </span>
                </div>

                {/* Tags */}
                {widget.tags && widget.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {widget.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {widget.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                        +{widget.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => openWidget(widget)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    Open Widget
                  </Button>
                  <Button
                    onClick={() => handleLike(widget.id)}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => openSharedPage(widget)}
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {widgets.length === 0 && (
          <Card className="bg-black/50 border-orange-500/30">
            <CardContent className="p-12 text-center">
              <Share2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No widgets found</h3>
              <p className="text-gray-400 mb-4">
                {search || selectedType 
                  ? "Try adjusting your search or filters"
                  : "Be the first to share a widget with the community!"
                }
              </p>
              {session && (
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <a href="/configure">Create Widget</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {session && widgets.length > 0 && (
          <Card className="bg-black/50 border-orange-500/30 mt-8">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Share Your Own Widget</h3>
              <p className="text-gray-400 mb-4">
                Create and share your own crypto dashboard widgets with the community
              </p>
              <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <a href="/configure">Start Creating</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
