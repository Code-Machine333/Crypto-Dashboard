export interface StreamConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  compression: boolean
  authentication?: {
    type: 'bearer' | 'api-key' | 'basic'
    token: string
  }
}

export interface StreamMessage {
  id: string
  type: string
  data: any
  timestamp: Date
  source: string
}

export interface StreamStats {
  connected: boolean
  messagesReceived: number
  messagesSent: number
  reconnectCount: number
  lastMessage?: Date
  connectionTime?: Date
  latency?: number
}

export class RealTimeStream {
  private static instance: RealTimeStream
  private eventSource: EventSource | null = null
  private config: StreamConfig
  private stats: StreamStats
  private messageHandlers: Map<string, Function[]> = new Map()
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts: number = 0

  constructor(config: StreamConfig) {
    this.config = config
    this.stats = {
      connected: false,
      messagesReceived: 0,
      messagesSent: 0,
      reconnectCount: 0
    }
  }

  static getInstance(config?: StreamConfig): RealTimeStream {
    if (!RealTimeStream.instance && config) {
      RealTimeStream.instance = new RealTimeStream(config)
    }
    return RealTimeStream.instance
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.config.url)
        
        this.eventSource.onopen = () => {
          this.stats.connected = true
          this.stats.connectionTime = new Date()
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected')
          resolve()
        }

        this.eventSource.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.eventSource.onerror = (error) => {
          this.stats.connected = false
          this.emit('error', error)
          this.handleReconnect()
          reject(error)
        }

        // Handle custom event types
        this.eventSource.addEventListener('marketcap', (event) => {
          this.handleCustomMessage('marketcap', event)
        })

        this.eventSource.addEventListener('donation', (event) => {
          this.handleCustomMessage('donation', event)
        })

        this.eventSource.addEventListener('buy', (event) => {
          this.handleCustomMessage('buy', event)
        })

        this.eventSource.addEventListener('chat', (event) => {
          this.handleCustomMessage('chat', event)
        })

        this.eventSource.addEventListener('burn', (event) => {
          this.handleCustomMessage('burn', event)
        })

        this.eventSource.addEventListener('heartbeat', (event) => {
          this.handleHeartbeat(event)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stats.connected = false
    this.emit('disconnected')
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      const message: StreamMessage = {
        id: data.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: data.type || 'message',
        data: data.data || data,
        timestamp: new Date(data.timestamp || Date.now()),
        source: data.source || 'unknown'
      }
      
      this.stats.messagesReceived++
      this.stats.lastMessage = new Date()
      
      this.emit('message', message)
      this.emit(message.type, message.data)
      
    } catch (error) {
      console.error('Failed to parse stream message:', error)
      this.emit('parse-error', { error, rawData: event.data })
    }
  }

  private handleCustomMessage(type: string, event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      this.emit(type, data)
    } catch (error) {
      console.error(`Failed to parse ${type} message:`, error)
    }
  }

  private handleHeartbeat(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      this.stats.latency = Date.now() - data.timestamp
      this.emit('heartbeat', data)
    } catch (error) {
      console.error('Failed to parse heartbeat:', error)
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    
    this.heartbeatTimer = setInterval(() => {
      if (this.stats.connected) {
        this.sendHeartbeat()
      }
    }, this.config.heartbeatInterval)
  }

  private sendHeartbeat(): void {
    // Send heartbeat to server
    this.emit('heartbeat-request', { timestamp: Date.now() })
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit('max-reconnect-attempts-reached')
      return
    }
    
    this.reconnectAttempts++
    this.stats.reconnectCount++
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, this.config.reconnectInterval)
  }

  // Event system
  on(event: string, handler: Function): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event)!.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  // Public methods
  getStats(): StreamStats {
    return { ...this.stats }
  }

  isConnected(): boolean {
    return this.stats.connected
  }

  // Data transformation utilities
  transformMarketCapData(data: any): any {
    return {
      marketCap: data.mc || data.marketCap || 0,
      price: data.price || 0,
      change: data.change || 0,
      volume: data.volume || 0,
      timestamp: new Date()
    }
  }

  transformDonationData(data: any): any {
    return {
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      message: data.message || '',
      donor: data.donor || data.user || 'Anonymous',
      timestamp: new Date()
    }
  }

  transformBuyData(data: any): any {
    return {
      amount: data.amount || 0,
      token: data.token || 'UNKNOWN',
      wallet: data.wallet || data.address || '',
      timestamp: new Date()
    }
  }

  transformChatData(data: any): any {
    return {
      message: data.message || data.text || '',
      user: data.user || data.username || 'Anonymous',
      badge: data.badge || null,
      timestamp: new Date()
    }
  }

  transformBurnData(data: any): any {
    return {
      burned: data.burned || 0,
      goal: data.goal || 0,
      percentage: data.percentage || 0,
      timestamp: new Date()
    }
  }
}

// Stream manager for multiple streams
export class StreamManager {
  private streams: Map<string, RealTimeStream> = new Map()
  private globalHandlers: Map<string, Function[]> = new Map()

  addStream(name: string, config: StreamConfig): RealTimeStream {
    const stream = new RealTimeStream(config)
    this.streams.set(name, stream)
    
    // Forward all events to global handlers
    stream.on('message', (data: any) => this.emit('message', { stream: name, data }))
    stream.on('error', (error: any) => this.emit('error', { stream: name, error }))
    stream.on('connected', () => this.emit('connected', { stream: name }))
    stream.on('disconnected', () => this.emit('disconnected', { stream: name }))
    
    return stream
  }

  removeStream(name: string): boolean {
    const stream = this.streams.get(name)
    if (stream) {
      stream.disconnect()
      this.streams.delete(name)
      return true
    }
    return false
  }

  getStream(name: string): RealTimeStream | undefined {
    return this.streams.get(name)
  }

  connectAll(): Promise<void[]> {
    const promises = Array.from(this.streams.values()).map(stream => 
      stream.connect()
    )
    return Promise.all(promises)
  }

  disconnectAll(): void {
    this.streams.forEach(stream => stream.disconnect())
  }

  getStats(): Record<string, StreamStats> {
    const stats: Record<string, StreamStats> = {}
    this.streams.forEach((stream, name) => {
      stats[name] = stream.getStats()
    })
    return stats
  }

  // Global event system
  on(event: string, handler: Function): void {
    if (!this.globalHandlers.has(event)) {
      this.globalHandlers.set(event, [])
    }
    this.globalHandlers.get(event)!.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.globalHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.globalHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in global event handler for ${event}:`, error)
        }
      })
    }
  }
}

// Export singleton stream manager
export const streamManager = new StreamManager()

// Predefined stream configurations
export const STREAM_CONFIGS = {
  development: {
    url: 'http://localhost:3000/api/stream',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    compression: false
  },
  production: {
    url: 'https://api.streamertools.fun/stream',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 60000,
    compression: true
  }
}
