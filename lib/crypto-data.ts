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

// Simple crypto data service without WebSocket for now
class CryptoDataService {
  private subscribers: Set<(data: CryptoData) => void> = new Set()
  private updateInterval: NodeJS.Timeout | null = null
  private isRunning = false

  constructor() {
    // Start polling for updates every 30 seconds
    this.startPolling()
  }

  private startPolling() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.updateInterval = setInterval(async () => {
      try {
        const prices = await this.getCurrentPrices()
        const cryptoData: CryptoData = {
          prices,
          lastUpdated: new Date()
        }
        this.notifySubscribers(cryptoData)
      } catch (error) {
        console.error('Error polling crypto prices:', error)
      }
    }, 30000) // Update every 30 seconds
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
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    
    this.isRunning = false
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
