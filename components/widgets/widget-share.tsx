'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Share2, Copy, ExternalLink, MessageCircle, Users, Eye } from 'lucide-react'

interface WidgetShareProps {
  widgetId: string
  widgetType: string
  config: any
  onShare?: (shareData: any) => void
}

export function WidgetShare({ widgetId, widgetType, config, onShare }: WidgetShareProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareData, setShareData] = useState<any>(null)
  const [shareConfig, setShareConfig] = useState({
    isPublic: false,
    description: '',
    allowComments: true,
    allowCollaboration: false
  })

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const response = await fetch('/api/widgets/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          widgetId,
          widgetType,
          config,
          ...shareConfig
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShareData(data.data)
        onShare?.(data.data)
      } else {
        console.error('Failed to share widget:', data.error)
      }
    } catch (error) {
      console.error('Error sharing widget:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (shareData) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Widget Shared Successfully!
          </CardTitle>
          <CardDescription>
            Your widget is now available for others to view and use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Share URL</Label>
            <div className="flex gap-2">
              <Input
                value={shareData.shareUrl}
                readOnly
                className="bg-gray-700"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareData.shareUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Share Token</Label>
            <div className="flex gap-2">
              <Input
                value={shareData.shareToken}
                readOnly
                className="bg-gray-700"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareData.shareToken)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={shareData.isPublic ? 'default' : 'secondary'}>
              {shareData.isPublic ? 'Public' : 'Private'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(shareData.shareUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Widget
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShareData(null)}
              className="w-full"
            >
              Share Another Widget
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Widget
        </CardTitle>
        <CardDescription>
          Make your widget available to others in the community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic">Make Public</Label>
            <Switch
              id="isPublic"
              checked={shareConfig.isPublic}
              onCheckedChange={(checked) => setShareConfig(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your widget and how others can use it..."
              value={shareConfig.description}
              onChange={(e) => setShareConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allowComments">Allow Comments</Label>
            <Switch
              id="allowComments"
              checked={shareConfig.allowComments}
              onCheckedChange={(checked) => setShareConfig(prev => ({ ...prev, allowComments: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allowCollaboration">Allow Collaboration</Label>
            <Switch
              id="allowCollaboration"
              checked={shareConfig.allowCollaboration}
              onCheckedChange={(checked) => setShareConfig(prev => ({ ...prev, allowCollaboration: checked }))}
            />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">What happens when you share?</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Others can view and use your widget configuration
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Community can leave comments and feedback
            </li>
            <li className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborators can help improve the widget
            </li>
          </ul>
        </div>

        <Button
          onClick={handleShare}
          disabled={isSharing}
          className="w-full"
        >
          {isSharing ? 'Sharing...' : 'Share Widget'}
        </Button>
      </CardContent>
    </Card>
  )
}
