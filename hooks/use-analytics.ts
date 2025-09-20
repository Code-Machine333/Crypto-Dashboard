"use client"

import { useCallback } from "react"

export interface AnalyticsEvent {
  widgetType: string
  widgetId?: string
  event: 'view' | 'interaction' | 'share' | 'configure' | 'preset_save' | 'preset_load'
  metadata?: Record<string, any>
}

export function useAnalytics() {
  const track = useCallback(async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
      // Don't throw - analytics should never break the app
    }
  }, [])

  const trackView = useCallback((widgetType: string, widgetId?: string, metadata?: Record<string, any>) => {
    track({ widgetType, widgetId, event: 'view', metadata })
  }, [track])

  const trackInteraction = useCallback((widgetType: string, widgetId?: string, metadata?: Record<string, any>) => {
    track({ widgetType, widgetId, event: 'interaction', metadata })
  }, [track])

  const trackShare = useCallback((widgetType: string, widgetId?: string, metadata?: Record<string, any>) => {
    track({ widgetType, widgetId, event: 'share', metadata })
  }, [track])

  const trackConfigure = useCallback((widgetType: string, widgetId?: string, metadata?: Record<string, any>) => {
    track({ widgetType, widgetId, event: 'configure', metadata })
  }, [track])

  const trackPresetSave = useCallback((widgetType: string, widgetId?: string, metadata?: Record<string, any>) => {
    track({ widgetType, widgetId, event: 'preset_save', metadata })
  }, [track])

  const trackPresetLoad = useCallback((widgetType: string, widgetId?: string, metadata?: Record<string, any>) => {
    track({ widgetType, widgetId, event: 'preset_load', metadata })
  }, [track])

  return {
    track,
    trackView,
    trackInteraction,
    trackShare,
    trackConfigure,
    trackPresetSave,
    trackPresetLoad,
  }
}
