"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Trash2, 
  Play, 
  Eye, 
  Settings, 
  Webhook,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

interface WebhookData {
  id: string
  name: string
  url: string
  secret?: string
  events: string[]
  isActive: boolean
  retryCount: number
  lastTriggered?: string
  createdAt: string
}

interface WebhookLog {
  id: string
  event: string
  payload: string
  response?: string
  statusCode?: number
  success: boolean
  error?: string
  triggeredAt: string
  webhook: {
    name: string
    url: string
  }
}

const AVAILABLE_EVENTS = [
  'analytics.view',
  'analytics.interaction',
  'analytics.share',
  'analytics.configure',
  'analytics.preset_save',
  'analytics.preset_load',
  'widget.market_cap_update',
  'widget.donation_received',
  'widget.buy_detected',
  'widget.chat_message',
  'widget.burn_progress',
  'webhook.test',
]

export default function WebhooksPage() {
  const { data: session } = useSession()
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchWebhooks()
    }
  }, [session])

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/webhooks')
      const data = await res.json()
      if (data.ok) {
        setWebhooks(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/logs`)
      const data = await res.json()
      if (data.ok) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const createWebhook = async () => {
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      if (data.ok) {
        setWebhooks([data.data, ...webhooks])
        setShowCreateForm(false)
        setFormData({ name: '', url: '', secret: '', events: [] })
      }
    } catch (error) {
      console.error('Failed to create webhook:', error)
    }
  }

  const deleteWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setWebhooks(webhooks.filter(w => w.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const testWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, {
        method: 'POST',
      })
      
      const data = await res.json()
      if (data.ok) {
        alert(`Test ${data.data.success ? 'successful' : 'failed'}: ${data.data.error || 'OK'}`)
      }
    } catch (error) {
      console.error('Failed to test webhook:', error)
    }
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Webhooks
            </CardTitle>
            <CardDescription>
              Sign in to manage your webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">
        <div className="text-white">Loading webhooks...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
            Webhooks
          </h1>
          <p className="text-gray-400">Connect your widgets to external services</p>
        </div>

        {/* Create Webhook Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Webhook
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="bg-black/50 border-orange-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create New Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Discord Webhook"
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Secret (Optional)</Label>
                <Input
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="webhook-secret-key"
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Events to Listen For</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <div key={event} className="flex items-center space-x-2">
                      <Checkbox
                        id={event}
                        checked={formData.events.includes(event)}
                        onCheckedChange={() => toggleEvent(event)}
                      />
                      <Label htmlFor={event} className="text-sm text-gray-300">
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createWebhook} className="bg-orange-500 hover:bg-orange-600">
                  Create Webhook
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Webhooks List */}
        <div className="grid gap-6">
          {webhooks.map(webhook => (
            <Card key={webhook.id} className="bg-black/50 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook className="w-5 h-5 text-orange-500" />
                    <div>
                      <CardTitle className="text-white">{webhook.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {webhook.url}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testWebhook(webhook.id)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWebhook(selectedWebhook === webhook.id ? null : webhook.id)
                        if (selectedWebhook !== webhook.id) {
                          fetchLogs(webhook.id)
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <div className="flex items-center gap-1">
                      {webhook.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-white">
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Events</p>
                    <p className="text-sm text-white">{webhook.events.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Retries</p>
                    <p className="text-sm text-white">{webhook.retryCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Triggered</p>
                    <p className="text-sm text-white">
                      {webhook.lastTriggered 
                        ? new Date(webhook.lastTriggered).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Events:</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <span 
                        key={event}
                        className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Logs */}
                {selectedWebhook === webhook.id && (
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <h4 className="text-white mb-3">Recent Logs</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {logs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                          <div className="flex items-center gap-2">
                            {log.success ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm text-white">{log.event}</span>
                            {log.statusCode && (
                              <span className="text-xs text-gray-400">{log.statusCode}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(log.triggeredAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {webhooks.length === 0 && (
          <Card className="bg-black/50 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <Webhook className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No webhooks configured yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first webhook to start receiving real-time events
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
