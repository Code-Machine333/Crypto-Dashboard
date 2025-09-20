import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const webhook = await db.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!webhook) {
      return jsonError("Webhook not found", 404)
    }

    return jsonOK({
      ...webhook,
      events: JSON.parse(webhook.events),
    })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const body = await req.json()
    const parsed = updateWebhookSchema.safeParse(body)
    
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }

    const updateData: any = {}
    if (parsed.data.name) updateData.name = parsed.data.name
    if (parsed.data.url) updateData.url = parsed.data.url
    if (parsed.data.secret !== undefined) updateData.secret = parsed.data.secret || null
    if (parsed.data.events) updateData.events = JSON.stringify(parsed.data.events)
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive

    const webhook = await db.webhook.update({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the webhook
      },
      data: updateData,
    })

    return jsonOK({
      ...webhook,
      events: JSON.parse(webhook.events),
    })
  } catch (error: any) {
    if (error.code === "P2025") return jsonError("Webhook not found", 404)
    return jsonError(error?.message || "Internal Error", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    await db.webhook.delete({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the webhook
      },
    })

    return jsonOK({ deleted: true })
  } catch (error: any) {
    if (error.code === "P2025") return jsonError("Webhook not found", 404)
    return jsonError(error?.message || "Internal Error", 500)
  }
}
