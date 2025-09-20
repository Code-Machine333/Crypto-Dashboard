import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1),
})

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const webhooks = await db.webhook.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return jsonOK(webhooks.map(webhook => ({
      ...webhook,
      events: JSON.parse(webhook.events),
    })))
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const body = await req.json()
    const parsed = createWebhookSchema.safeParse(body)
    
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }

    const { name, url, secret, events } = parsed.data

    const webhook = await db.webhook.create({
      data: {
        userId: session.user.id,
        name,
        url,
        secret: secret || null,
        events: JSON.stringify(events),
      },
    })

    return jsonOK({
      ...webhook,
      events: JSON.parse(webhook.events),
    })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
