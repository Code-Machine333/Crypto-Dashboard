import { WebSocket } from 'ws'

export interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  lastUpdated: Date
}

export interface CryptoData {
  prices: CryptoPrice[]
  lastUpdated: Date
}

class CryptoDataService {
  private ws: WebSocket | null = null
  private subscribers: Set<(data: CryptoData) => void> = new Set()
  private reconnectInterval: NodeJS.Timeout | null = null
  private isConnected = false

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      // Using CoinGecko WebSocket API (free tier)
      this.ws = new WebSocket('wss://ws.coingecko.com/v3/ws')
      
      this.ws.on('open', () => {
        console.log('Connected to CoinGecko WebSocket')
        this.isConnected = true
        this.subscribeToPrices()
      })

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          if (message.type === 'price') {
            this.handlePriceUpdate(message.data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })

      this.ws.on('close', () => {
        console.log('WebSocket connection closed')
        this.isConnected = false
        this.scheduleReconnect()
      })

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
        this.scheduleReconnect()
      })
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  private subscribeToPrices() {
    if (this.ws && this.isConnected) {
      // Subscribe to top cryptocurrencies
      const symbols = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'chainlink', 'litecoin']
      
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channels: ['prices']
      }))
    }
  }

  private handlePriceUpdate(data: any) {
    const cryptoData: CryptoData = {
      prices: data.map((item: any) => ({
        symbol: item.id,
        price: item.current_price,
        change24h: item.price_change_24h,
        changePercent24h: item.price_change_percentage_24h,
        volume24h: item.total_volume,
        marketCap: item.market_cap,
        lastUpdated: new Date()
      })),
      lastUpdated: new Date()
    }

    this.notifySubscribers(cryptoData)
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval)
    }

    this.reconnectInterval = setTimeout(() => {
      console.log('Attempting to reconnect to WebSocket...')
      this.connect()
    }, 5000)
  }

  private notifySubscribers(data: CryptoData) {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  public subscribe(callback: (data: CryptoData) => void) {
    this.subscribers.add(callback)
    
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public async getCurrentPrices(): Promise<CryptoPrice[]> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false')
      const data = await response.json()
      
      return data.map((coin: any) => ({
        symbol: coin.id,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        volume24h: coin.total_volume,
        marketCap: coin.market_cap,
        lastUpdated: new Date()
      }))
    } catch (error) {
      console.error('Error fetching current prices:', error)
      return []
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval)
      this.reconnectInterval = null
    }
    
    this.isConnected = false
  }
}

// Singleton instance
export const cryptoDataService = new CryptoDataService()

// Fallback API functions for when WebSocket is not available
export async function getCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false')
    const data = await response.json()
    
    return data.map((coin: any) => ({
      symbol: coin.id,
      price: coin.current_price,
      change24h: coin.price_change_24h,
      changePercent24h: coin.price_change_percentage_24h,
      volume24h: coin.total_volume,
      marketCap: coin.market_cap,
      lastUpdated: new Date()
    }))
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return []
  }
}

export async function getCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
    const data = await response.json()
    
    if (data.error) {
      return null
    }
    
    return {
      symbol: data.id,
      price: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_24h,
      changePercent24h: data.market_data.price_change_percentage_24h,
      volume24h: data.market_data.total_volume.usd,
      marketCap: data.market_data.market_cap.usd,
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}
