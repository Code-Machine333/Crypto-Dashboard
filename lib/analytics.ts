import { db } from "@/lib/db"
import { headers } from "next/headers"

export interface AnalyticsEvent {
  userId?: string
  widgetType: string
  widgetId?: string
  event: 'view' | 'interaction' | 'share' | 'configure' | 'preset_save' | 'preset_load'
  metadata?: Record<string, any>
}

export async function trackEvent(event: AnalyticsEvent) {
  try {
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || undefined
    const referrer = headersList.get('referer') || undefined
    const forwarded = headersList.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : undefined

    await db.widgetAnalytics.create({
      data: {
        userId: event.userId,
        widgetType: event.widgetType,
        widgetId: event.widgetId,
        event: event.event,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        userAgent,
        ipAddress,
        referrer,
      },
    })

    // Update user metrics if userId provided
    if (event.userId) {
      await updateUserMetrics(event.userId, event.event)
    }

    // Trigger webhooks for analytics events
    const { triggerWebhooks } = await import('@/lib/webhooks')
    await triggerWebhooks({
      type: `analytics.${event.event}`,
      data: {
        widgetType: event.widgetType,
        widgetId: event.widgetId,
        metadata: event.metadata,
      },
      timestamp: new Date().toISOString(),
      userId: event.userId,
      widgetType: event.widgetType,
      widgetId: event.widgetId,
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Don't throw - analytics should never break the app
  }
}

async function updateUserMetrics(userId: string, event: string) {
  try {
    const metrics = await db.userMetrics.upsert({
      where: { userId },
      update: {
        totalWidgetViews: event === 'view' ? { increment: 1 } : undefined,
        totalInteractions: event === 'interaction' ? { increment: 1 } : undefined,
        totalShares: event === 'share' ? { increment: 1 } : undefined,
        lastActiveAt: new Date(),
      },
      create: {
        userId,
        totalWidgetViews: event === 'view' ? 1 : 0,
        totalInteractions: event === 'interaction' ? 1 : 0,
        totalShares: event === 'share' ? 1 : 0,
        lastActiveAt: new Date(),
      },
    })
  } catch (error) {
    console.error('User metrics update error:', error)
  }
}

export async function getAnalyticsSummary(userId: string, days: number = 30) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [events, metrics] = await Promise.all([
      db.widgetAnalytics.findMany({
        where: {
          userId,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      db.userMetrics.findUnique({
        where: { userId },
      }),
    ])

    // Calculate detailed metrics
    const totalViews = events.filter(e => e.event === 'view').length
    const totalInteractions = events.filter(e => e.event === 'interaction').length
    const totalShares = events.filter(e => e.event === 'share').length
    const totalConfigures = events.filter(e => e.event === 'configure').length
    const totalPresetSaves = events.filter(e => e.event === 'preset_save').length
    const totalPresetLoads = events.filter(e => e.event === 'preset_load').length

    // Get unique users (approximate)
    const uniqueUsers = new Set(events.map(e => e.ipAddress).filter(Boolean)).size

    // Calculate average session time (mock data for now)
    const averageSessionTime = Math.round(Math.random() * 300 + 60) // 1-5 minutes

    // Get top widgets with enhanced data
    const widgetStats = events.reduce((acc, event) => {
      if (!acc[event.widgetType]) {
        acc[event.widgetType] = { 
          views: 0, 
          interactions: 0, 
          shares: 0, 
          configures: 0,
          presetSaves: 0,
          presetLoads: 0
        }
      }
      if (event.event === 'view') acc[event.widgetType].views++
      if (event.event === 'interaction') acc[event.widgetType].interactions++
      if (event.event === 'share') acc[event.widgetType].shares++
      if (event.event === 'configure') acc[event.widgetType].configures++
      if (event.event === 'preset_save') acc[event.widgetType].presetSaves++
      if (event.event === 'preset_load') acc[event.widgetType].presetLoads++
      return acc
    }, {} as Record<string, { 
      views: number; 
      interactions: number; 
      shares: number;
      configures: number;
      presetSaves: number;
      presetLoads: number;
    }>)

    const topWidgets = Object.entries(widgetStats)
      .map(([name, stats]) => ({
        name: name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        views: stats.views,
        interactions: stats.interactions,
        shares: stats.shares,
        configures: stats.configures,
        presetSaves: stats.presetSaves,
        presetLoads: stats.presetLoads,
        type: name,
        engagementRate: stats.views > 0 ? (stats.interactions / stats.views) * 100 : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    // Get daily activity with more detailed metrics
    const dailyActivity = Array.from({ length: days }, (_, i) => {
      const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000)
      const dayEvents = events.filter(e => 
        e.createdAt.toDateString() === date.toDateString()
      )
      
      return {
        date: date.toISOString().split('T')[0],
        views: dayEvents.filter(e => e.event === 'view').length,
        interactions: dayEvents.filter(e => e.event === 'interaction').length,
        shares: dayEvents.filter(e => e.event === 'share').length,
        configures: dayEvents.filter(e => e.event === 'configure').length,
        uniqueUsers: new Set(dayEvents.map(e => e.ipAddress).filter(Boolean)).size
      }
    })

    // Get recent activity with enhanced details
    const recentActivity = events.slice(0, 20).map(event => {
      const metadata = event.metadata ? JSON.parse(event.metadata) : null
      let description = `${event.event} on ${event.widgetType}`
      
      // Enhanced descriptions based on event type and metadata
      if (event.event === 'view' && metadata?.widgetId) {
        description = `Viewed ${event.widgetType} widget`
      } else if (event.event === 'interaction' && metadata?.action) {
        description = `${metadata.action} on ${event.widgetType}`
      } else if (event.event === 'share' && metadata?.platform) {
        description = `Shared ${event.widgetType} to ${metadata.platform}`
      } else if (event.event === 'preset_save') {
        description = `Saved preset for ${event.widgetType}`
      } else if (event.event === 'preset_load') {
        description = `Loaded preset for ${event.widgetType}`
      } else if (event.event === 'configure') {
        description = `Configured ${event.widgetType} widget`
      }
      
      return {
        id: event.id,
        type: event.event,
        description,
        timestamp: event.createdAt.toISOString(),
        metadata,
        widgetType: event.widgetType,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress
      }
    })

    // Calculate growth metrics
    const previousPeriodStart = new Date(since.getTime() - days * 24 * 60 * 60 * 1000)
    const previousEvents = await db.widgetAnalytics.findMany({
      where: {
        userId,
        createdAt: {
          gte: previousPeriodStart,
          lt: since
        }
      }
    })

    const previousViews = previousEvents.filter(e => e.event === 'view').length
    const previousInteractions = previousEvents.filter(e => e.event === 'interaction').length
    const previousShares = previousEvents.filter(e => e.event === 'share').length

    const viewsGrowth = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0
    const interactionsGrowth = previousInteractions > 0 ? ((totalInteractions - previousInteractions) / previousInteractions) * 100 : 0
    const sharesGrowth = previousShares > 0 ? ((totalShares - previousShares) / previousShares) * 100 : 0

    // Get hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourEvents = events.filter(e => e.createdAt.getHours() === hour)
      return {
        hour,
        views: hourEvents.filter(e => e.event === 'view').length,
        interactions: hourEvents.filter(e => e.event === 'interaction').length
      }
    })

    // Get device/browser stats
    const deviceStats = events.reduce((acc, event) => {
      if (!event.userAgent) return acc
      
      const isMobile = /Mobile|Android|iPhone|iPad/.test(event.userAgent)
      const isChrome = /Chrome/.test(event.userAgent)
      const isFirefox = /Firefox/.test(event.userAgent)
      const isSafari = /Safari/.test(event.userAgent) && !isChrome
      
      const device = isMobile ? 'Mobile' : 'Desktop'
      const browser = isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Other'
      
      if (!acc.devices[device]) acc.devices[device] = 0
      if (!acc.browsers[browser]) acc.browsers[browser] = 0
      
      acc.devices[device]++
      acc.browsers[browser]++
      
      return acc
    }, { devices: {} as Record<string, number>, browsers: {} as Record<string, number> })

    return {
      totalViews,
      totalInteractions,
      totalShares,
      totalConfigures,
      totalPresetSaves,
      totalPresetLoads,
      uniqueUsers,
      averageSessionTime,
      topWidgets,
      dailyActivity,
      recentActivity,
      growth: {
        views: Math.round(viewsGrowth * 100) / 100,
        interactions: Math.round(interactionsGrowth * 100) / 100,
        shares: Math.round(sharesGrowth * 100) / 100
      },
      hourlyDistribution,
      deviceStats,
      userMetrics: metrics,
      // Legacy fields for backward compatibility
      totalEvents: events.length,
      eventCounts: events.reduce((acc, event) => {
        const key = `${event.widgetType}-${event.event}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      widgetPopularity: events.reduce((acc, event) => {
        acc[event.widgetType] = (acc[event.widgetType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentEvents: events.slice(0, 20).map(event => ({
        ...event,
        metadata: event.metadata ? JSON.parse(event.metadata) : null,
      })),
    }
  } catch (error) {
    console.error('Analytics summary error:', error)
    return null
  }
}

export async function getPublicAnalytics(days: number = 7) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const events = await db.widgetAnalytics.findMany({
      where: {
        createdAt: { gte: since },
      },
      select: {
        widgetType: true,
        event: true,
        createdAt: true,
      },
    })

    // Aggregate public stats
    const totalViews = events.filter(e => e.event === 'view').length
    const totalInteractions = events.filter(e => e.event === 'interaction').length
    const totalShares = events.filter(e => e.event === 'share').length

    const widgetStats = events.reduce((acc, event) => {
      if (!acc[event.widgetType]) {
        acc[event.widgetType] = { views: 0, interactions: 0, shares: 0 }
      }
      if (event.event === 'view') acc[event.widgetType].views++
      if (event.event === 'interaction') acc[event.widgetType].interactions++
      if (event.event === 'share') acc[event.widgetType].shares++
      return acc
    }, {} as Record<string, { views: number; interactions: number; shares: number }>)

    return {
      totalViews,
      totalInteractions,
      totalShares,
      widgetStats,
      period: `${days} days`,
    }
  } catch (error) {
    console.error('Public analytics error:', error)
    return null
  }
}
