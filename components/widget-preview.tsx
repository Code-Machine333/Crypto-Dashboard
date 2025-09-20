"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Settings,
  TrendingUp,
  Heart,
  MessageCircle,
  Clock,
  Flame
} from "lucide-react"

interface WidgetPreviewProps {
  widgetType: string
  config: any
  isLive?: boolean
  onFullscreen?: () => void
}

export function WidgetPreview({ 
  widgetType, 
  config, 
  isLive = false, 
  onFullscreen 
}: WidgetPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentDemo, setCurrentDemo] = useState(0)

  const demos = {
    'market-cap': [
      { price: '$0.0001234', change: '+12.5%', volume: '1.2M' },
      { price: '$0.0001456', change: '+18.2%', volume: '1.8M' },
      { price: '$0.0001321', change: '+8.7%', volume: '1.5M' }
    ],
    'donations': [
      { amount: '0.5 SOL', message: 'Great stream!', user: 'CryptoFan123' },
      { amount: '1.2 SOL', message: 'Love the content!', user: 'MoonBoy' },
      { amount: '0.8 SOL', message: 'Keep it up!', user: 'DiamondHands' }
    ],
    'buy-bot': [
      { amount: '500', token: 'PEPE', wallet: '0x1234...5678' },
      { amount: '1000', token: 'DOGE', wallet: '0x9876...5432' },
      { amount: '2000', token: 'SHIB', wallet: '0x4567...8901' }
    ],
    'chat-widget': [
      { message: 'To the moon! 🚀', user: 'CryptoKing', badge: 'VIP' },
      { message: 'This is amazing!', user: 'NewUser', badge: null },
      { message: 'HODL strong! 💎', user: 'DiamondHands', badge: 'MOD' }
    ],
    'burn-goals': [
      { burned: '45%', goal: '1M tokens', remaining: '550K' },
      { burned: '67%', goal: '1M tokens', remaining: '330K' },
      { burned: '89%', goal: '1M tokens', remaining: '110K' }
    ],
    'subathon-timer': [
      { time: '02:45:30', extensions: 3, donations: '$45.67' },
      { time: '03:12:15', extensions: 5, donations: '$67.89' },
      { time: '01:58:42', extensions: 2, donations: '$23.45' }
    ]
  }

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % demos[widgetType as keyof typeof demos].length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, widgetType])

  const currentData = demos[widgetType as keyof typeof demos]?.[currentDemo]

  const renderWidget = () => {
    switch (widgetType) {
      case 'market-cap':
        return (
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {(currentData as any)?.price}
            </div>
            <div className="text-lg text-green-300 mb-1">
              {(currentData as any)?.change}
            </div>
            <div className="text-sm text-gray-400">
              Vol: {(currentData as any)?.volume}
            </div>
          </div>
        )

      case 'donations':
        return (
          <div className="p-4 border-l-4 border-orange-500 bg-orange-500/10">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-bold text-orange-500">
                  {(currentData as any)?.amount}
                </div>
                <div className="text-sm text-gray-300">
                  {(currentData as any)?.message}
                </div>
                <div className="text-xs text-gray-400">
                  - {(currentData as any)?.user}
                </div>
              </div>
            </div>
          </div>
        )

      case 'buy-bot':
        return (
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-bold text-green-400">
                  BUY {(currentData as any)?.amount} {(currentData as any)?.token}
                </div>
                <div className="text-sm text-gray-300">
                  {(currentData as any)?.wallet}
                </div>
              </div>
            </div>
          </div>
        )

      case 'chat-widget':
        return (
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              {(currentData as any)?.badge && (
                <Badge variant="secondary" className="text-xs">
                  {(currentData as any).badge}
                </Badge>
              )}
              <span className="font-medium text-blue-400">
                {(currentData as any)?.user}:
              </span>
              <span className="text-gray-300">
                {(currentData as any)?.message}
              </span>
            </div>
          </div>
        )

      case 'burn-goals':
        return (
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-2">
              {(currentData as any)?.burned}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: (currentData as any)?.burned || '0%' }}
              />
            </div>
            <div className="text-sm text-gray-400">
              {(currentData as any)?.remaining} remaining
            </div>
          </div>
        )

      case 'subathon-timer':
        return (
          <div className="p-6 text-center">
            <div className="text-4xl font-bold text-pink-500 mb-2 font-mono">
              {(currentData as any)?.time}
            </div>
            <div className="text-sm text-gray-400 mb-1">
              TIME LEFT
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>{(currentData as any)?.extensions} extensions</span>
              <span>{(currentData as any)?.donations} raised</span>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-6 text-center text-gray-400">
            Select a widget to see preview
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-0">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
              {isLive ? "LIVE" : "PREVIEW"}
            </Badge>
            <span className="text-sm font-medium capitalize">
              {widgetType.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDemo(0)}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {onFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreen}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Widget Preview */}
        <div className="min-h-[200px] bg-black/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5" />
          <div className="relative z-10">
            {renderWidget()}
          </div>
        </div>

        {/* Preview Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Demo data • Auto-cycling</span>
            <span>{currentDemo + 1}/{demos[widgetType as keyof typeof demos]?.length || 1}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
