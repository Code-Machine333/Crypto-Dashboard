import { db } from "@/lib/db"
import crypto from "crypto"

export interface WebhookEvent {
  type: string
  data: Record<string, any>
  timestamp: string
  userId?: string
  widgetType?: string
  widgetId?: string
}

export interface WebhookPayload {
  event: string
  data: Record<string, any>
  timestamp: string
  source: string
  userId?: string
  widgetType?: string
  widgetId?: string
}

// Generate webhook signature for verification
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// Send webhook with retry logic
export async function sendWebhook(
  webhookId: string,
  event: WebhookEvent,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const webhook = await db.webhook.findUnique({
      where: { id: webhookId },
    })

    if (!webhook || !webhook.isActive) {
      return { success: false, error: 'Webhook not found or inactive' }
    }

    const payload: WebhookPayload = {
      event: event.type,
      data: event.data,
      timestamp: event.timestamp,
      source: 'crypto-dashboard',
      userId: event.userId,
      widgetType: event.widgetType,
      widgetId: event.widgetId,
    }

    const payloadString = JSON.stringify(payload)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'CryptoDashboard-Webhook/1.0',
    }

    // Add signature if secret is provided
    if (webhook.secret) {
      const signature = generateWebhookSignature(payloadString, webhook.secret)
      headers['X-Webhook-Signature'] = `sha256=${signature}`
    }

    let lastError: string | undefined
    let lastStatusCode: number | undefined

    // Retry logic
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: payloadString,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        const responseText = await response.text()
        const success = response.ok

        // Log the webhook attempt
        await db.webhookLog.create({
          data: {
            webhookId: webhook.id,
            event: event.type,
            payload: payloadString,
            response: responseText,
            statusCode: response.status,
            success,
            error: success ? null : `HTTP ${response.status}: ${responseText}`,
          },
        })

        if (success) {
          // Update webhook last triggered time
          await db.webhook.update({
            where: { id: webhook.id },
            data: {
              lastTriggered: new Date(),
              retryCount: 0, // Reset retry count on success
            },
          })

          return { success: true, statusCode: response.status }
        } else {
          lastError = `HTTP ${response.status}: ${responseText}`
          lastStatusCode = response.status
        }
      } catch (error: any) {
        lastError = error.message
        await db.webhookLog.create({
          data: {
            webhookId: webhook.id,
            event: event.type,
            payload: payloadString,
            response: null,
            statusCode: null,
            success: false,
            error: error.message,
          },
        })
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    // Update retry count if all attempts failed
    await db.webhook.update({
      where: { id: webhook.id },
      data: {
        retryCount: { increment: 1 },
      },
    })

    return { success: false, error: lastError, statusCode: lastStatusCode }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Trigger webhooks for a specific event
export async function triggerWebhooks(event: WebhookEvent): Promise<void> {
  try {
    // Find all active webhooks that listen for this event type
    const webhooks = await db.webhook.findMany({
      where: {
        isActive: true,
        events: {
          contains: event.type,
        },
      },
    })

    // Send webhook for each matching webhook
    const promises = webhooks.map(webhook => 
      sendWebhook(webhook.id, event).catch(error => {
        console.error(`Webhook ${webhook.id} failed:`, error)
      })
    )

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}

// Get webhook logs for a user
export async function getWebhookLogs(
  userId: string,
  webhookId?: string,
  limit: number = 50
) {
  try {
    const where: any = {
      webhook: {
        userId,
      },
    }

    if (webhookId) {
      where.webhookId = webhookId
    }

    const logs = await db.webhookLog.findMany({
      where,
      include: {
        webhook: {
          select: {
            name: true,
            url: true,
          },
        },
      },
      orderBy: {
        triggeredAt: 'desc',
      },
      take: limit,
    })

    return logs
  } catch (error) {
    console.error('Error fetching webhook logs:', error)
    return []
  }
}

// Test webhook endpoint
export async function testWebhook(webhookId: string): Promise<{
  success: boolean
  error?: string
  statusCode?: number
  responseTime?: number
}> {
  const startTime = Date.now()
  
  const testEvent: WebhookEvent = {
    type: 'webhook.test',
    data: {
      message: 'This is a test webhook from Crypto Dashboard',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  }

  const result = await sendWebhook(webhookId, testEvent, 1)
  const responseTime = Date.now() - startTime

  return {
    ...result,
    responseTime,
  }
}
