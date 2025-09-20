"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Share2 } from "lucide-react"

interface AnalyticsSummary {
  totalEvents: number
  eventCounts: Record<string, number>
  widgetPopularity: Record<string, number>
  dailyActivity: Record<string, number>
  userMetrics: {
    totalWidgetViews: number
    totalInteractions: number
    totalShares: number
    lastActiveAt: string
  }
  recentEvents: Array<{
    id: string
    widgetType: string
    event: string
    createdAt: string
    metadata: any
  }>
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics()
    }
  }, [session, days])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/summary?days=${days}`)
      const data = await res.json()
      if (data.ok) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Sign in to view your widget analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getWidgetDisplayName = (widget: string) => {
    const names: Record<string, string> = {
      'market-cap': 'Market Cap',
      'donations': 'Donations',
      'buy-bot': 'Buy Bot',
      'chat-widget': 'Chat Widget',
      'burn-goals': 'Burn Goals',
      'subathon': 'Subathon Timer',
    }
    return names[widget] || widget
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">Track your widget performance and user engagement</p>
        </div>

        {/* Time Period Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {[7, 30, 90].map((period) => (
              <Button
                key={period}
                variant={days === period ? "default" : "outline"}
                onClick={() => setDays(period)}
                className={days === period ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {period} days
              </Button>
            ))}
          </div>
        </div>

        {analytics ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/50 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Events</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalEvents)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Widget Views</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.userMetrics.totalWidgetViews)}</p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Interactions</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.userMetrics.totalInteractions)}</p>
                    </div>
                    <MousePointer className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Shares</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.userMetrics.totalShares)}</p>
                    </div>
                    <Share2 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Widget Popularity */}
            <Card className="bg-black/50 border-orange-500/30 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Widget Popularity</CardTitle>
                <CardDescription>Most used widgets in the last {days} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.widgetPopularity)
                    .sort(([,a], [,b]) => b - a)
                    .map(([widget, count]) => (
                      <div key={widget} className="flex items-center justify-between">
                        <span className="text-white">{getWidgetDisplayName(widget)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ 
                                width: `${(count / Math.max(...Object.values(analytics.widgetPopularity))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>Latest widget events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <div>
                          <p className="text-white text-sm">
                            {getWidgetDisplayName(event.widgetType)} - {event.event}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {event.metadata && (
                        <div className="text-gray-400 text-xs">
                          {JSON.stringify(event.metadata).slice(0, 50)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-black/50 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No analytics data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
