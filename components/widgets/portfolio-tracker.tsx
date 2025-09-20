'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { CryptoPrice } from '@/lib/crypto-data'

interface PortfolioItem {
  id: string
  symbol: string
  amount: number
  buyPrice: number
  currentPrice?: number
  value?: number
  profit?: number
  profitPercent?: number
}

interface PortfolioTrackerProps {
  config?: {
    showProfitLoss?: boolean
    showPercentages?: boolean
    theme?: 'dark' | 'light'
  }
  onConfigChange?: (config: any) => void
}

export function PortfolioTracker({ config = {}, onConfigChange }: PortfolioTrackerProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [newItem, setNewItem] = useState({ symbol: '', amount: 0, buyPrice: 0 })
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const defaultConfig = {
    showProfitLoss: true,
    showPercentages: true,
    theme: 'dark',
    ...config
  }

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/crypto/prices')
        const data = await response.json()
        if (data.success) {
          setCryptoPrices(data.data)
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Update portfolio with current prices
  useEffect(() => {
    if (cryptoPrices.length > 0) {
      setPortfolio(prev => prev.map(item => {
        const currentPrice = cryptoPrices.find(price => price.symbol === item.symbol)?.price
        if (currentPrice) {
          const value = item.amount * currentPrice
          const profit = value - (item.amount * item.buyPrice)
          const profitPercent = (profit / (item.amount * item.buyPrice)) * 100
          
          return {
            ...item,
            currentPrice,
            value,
            profit,
            profitPercent
          }
        }
        return item
      }))
    }
  }, [cryptoPrices])

  const addPortfolioItem = () => {
    if (newItem.symbol && newItem.amount > 0 && newItem.buyPrice > 0) {
      const item: PortfolioItem = {
        id: Date.now().toString(),
        symbol: newItem.symbol.toLowerCase(),
        amount: newItem.amount,
        buyPrice: newItem.buyPrice
      }
      
      setPortfolio(prev => [...prev, item])
      setNewItem({ symbol: '', amount: 0, buyPrice: 0 })
    }
  }

  const removePortfolioItem = (id: string) => {
    setPortfolio(prev => prev.filter(item => item.id !== id))
  }

  const totalValue = portfolio.reduce((sum, item) => sum + (item.value || 0), 0)
  const totalCost = portfolio.reduce((sum, item) => sum + (item.amount * item.buyPrice), 0)
  const totalProfit = totalValue - totalCost
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return (
    <Card className={`w-full ${defaultConfig.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Portfolio Tracker
        </CardTitle>
        <CardDescription>
          Track your cryptocurrency investments and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new item form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., bitcoin"
              value={newItem.symbol}
              onChange={(e) => setNewItem(prev => ({ ...prev, symbol: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={newItem.amount || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="buyPrice">Buy Price ($)</Label>
            <Input
              id="buyPrice"
              type="number"
              placeholder="0.00"
              value={newItem.buyPrice || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, buyPrice: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addPortfolioItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Cost</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              ${totalProfit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Portfolio items */}
        <div className="space-y-2">
          {portfolio.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase">{item.symbol}</span>
                  <Badge variant="outline">{item.amount} {item.symbol}</Badge>
                </div>
                <div className="text-sm text-gray-400">
                  Buy: ${item.buyPrice.toFixed(2)} | 
                  Current: ${item.currentPrice?.toFixed(2) || 'Loading...'} | 
                  Value: ${item.value?.toFixed(2) || 'Loading...'}
                </div>
                {defaultConfig.showProfitLoss && item.profit !== undefined && (
                  <div className={`text-sm ${
                    item.profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.profit >= 0 ? '+' : ''}${item.profit.toFixed(2)} 
                    {defaultConfig.showPercentages && item.profitPercent !== undefined && (
                      <span> ({item.profitPercent >= 0 ? '+' : ''}{item.profitPercent.toFixed(2)}%)</span>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePortfolioItem(item.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {portfolio.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No items in portfolio. Add some cryptocurrencies to get started!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
