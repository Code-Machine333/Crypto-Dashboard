"use client"

import { useEffect, useState, useRef } from "react"

interface UseSSEOptions {
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const [data, setData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const {
    onMessage,
    onError,
    onOpen,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      reconnectAttemptsRef.current = 0
      onOpen?.()
    }

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data)
        setData(parsedData)
        onMessage?.(parsedData)
      } catch (err) {
        console.error("Failed to parse SSE data:", err)
      }
    }

    eventSource.onerror = (event) => {
      setIsConnected(false)
      setError("Connection error")
      onError?.(event)

      // Attempt reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
    }

    // Handle custom events
    eventSource.addEventListener("heartbeat", () => {
      // Keep connection alive
    })
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [url])

  return {
    data,
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  }
}
