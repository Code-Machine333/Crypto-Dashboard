'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { CryptoPrice } from '@/lib/crypto-data'

interface PriceAlert {
  id: string
  symbol: string
  targetPrice: number
  condition: 'above' | 'below'
  isActive: boolean
  triggered: boolean
  createdAt: Date
}

interface PriceAlertsProps {
  config?: {
    maxAlerts?: number
    theme?: 'dark' | 'light'
    soundEnabled?: boolean
  }
  onConfigChange?: (config: any) => void
}

export function PriceAlerts({ config = {}, onConfigChange }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [newAlert, setNewAlert] = useState({ symbol: '', targetPrice: 0, condition: 'above' as const })
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const defaultConfig = {
    maxAlerts: 10,
    theme: 'dark',
    soundEnabled: true,
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

  // Check alerts against current prices
  useEffect(() => {
    if (cryptoPrices.length > 0) {
      setAlerts(prev => prev.map(alert => {
        const currentPrice = cryptoPrices.find(price => price.symbol === alert.symbol)?.price
        if (currentPrice && alert.isActive && !alert.triggered) {
          const shouldTrigger = alert.condition === 'above' 
            ? currentPrice >= alert.targetPrice 
            : currentPrice <= alert.targetPrice

          if (shouldTrigger) {
            // Trigger alert
            if (defaultConfig.soundEnabled) {
              // Play notification sound
              const audio = new Audio('/notification.mp3')
              audio.play().catch(() => {}) // Ignore errors if audio fails
            }
            
            return { ...alert, triggered: true }
          }
        }
        return alert
      }))
    }
  }, [cryptoPrices, defaultConfig.soundEnabled])

  const addAlert = () => {
    if (newAlert.symbol && newAlert.targetPrice > 0 && alerts.length < defaultConfig.maxAlerts) {
      const alert: PriceAlert = {
        id: Date.now().toString(),
        symbol: newAlert.symbol.toLowerCase(),
        targetPrice: newAlert.targetPrice,
        condition: newAlert.condition,
        isActive: true,
        triggered: false,
        createdAt: new Date()
      }
      
      setAlerts(prev => [...prev, alert])
      setNewAlert({ symbol: '', targetPrice: 0, condition: 'above' })
    }
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  const getCurrentPrice = (symbol: string) => {
    return cryptoPrices.find(price => price.symbol === symbol)?.price
  }

  const getAlertStatus = (alert: PriceAlert) => {
    const currentPrice = getCurrentPrice(alert.symbol)
    if (!currentPrice) return 'loading'
    
    if (alert.triggered) return 'triggered'
    
    const shouldTrigger = alert.condition === 'above' 
      ? currentPrice >= alert.targetPrice 
      : currentPrice <= alert.targetPrice
    
    return shouldTrigger ? 'ready' : 'waiting'
  }

  return (
    <Card className={`w-full ${defaultConfig.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Price Alerts
        </CardTitle>
        <CardDescription>
          Set up alerts for cryptocurrency price movements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new alert form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="symbol">Cryptocurrency</Label>
            <Input
              id="symbol"
              placeholder="e.g., bitcoin"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="targetPrice">Target Price ($)</Label>
            <Input
              id="targetPrice"
              type="number"
              placeholder="0.00"
              value={newAlert.targetPrice || ''}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={newAlert.condition}
              onValueChange={(value: 'above' | 'below') => setNewAlert(prev => ({ ...prev, condition: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addAlert} 
              className="w-full"
              disabled={alerts.length >= defaultConfig.maxAlerts}
            >
              <Bell className="w-4 h-4 mr-2" />
              Add Alert
            </Button>
          </div>
        </div>

        {/* Alerts list */}
        <div className="space-y-2">
          {alerts.map((alert) => {
            const currentPrice = getCurrentPrice(alert.symbol)
            const status = getAlertStatus(alert)
            
            return (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.triggered 
                  ? 'bg-green-900 border-green-700' 
                  : status === 'ready'
                  ? 'bg-yellow-900 border-yellow-700'
                  : 'bg-gray-700 border-gray-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold uppercase">{alert.symbol}</span>
                      <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {alert.triggered && (
                        <Badge variant="destructive">Triggered</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Alert when price goes {alert.condition} ${alert.targetPrice.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      Current: ${currentPrice?.toFixed(2) || 'Loading...'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'triggered' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {status === 'ready' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAlert(alert.id)}
                    >
                      {alert.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAlert(alert.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No alerts set up. Create your first price alert above!
          </div>
        )}

        {alerts.length >= defaultConfig.maxAlerts && (
          <div className="text-center py-4 text-yellow-400">
            Maximum number of alerts reached ({defaultConfig.maxAlerts})
          </div>
        )}
      </CardContent>
    </Card>
  )
}
