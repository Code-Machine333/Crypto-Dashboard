import { NextRequest } from "next/server"
import { trackEvent } from "@/lib/analytics"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"

const trackSchema = z.object({
  widgetType: z.string().min(1),
  widgetId: z.string().optional(),
  event: z.enum(['view', 'interaction', 'share', 'configure', 'preset_save', 'preset_load']),
  metadata: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const parsed = trackSchema.safeParse(body)
    
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }

    const { widgetType, widgetId, event, metadata } = parsed.data

    await trackEvent({
      userId: session?.user?.id,
      widgetType,
      widgetId,
      event,
      metadata,
    })

    return jsonOK({ tracked: true })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
