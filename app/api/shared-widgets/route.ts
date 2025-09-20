import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { z } from "zod"
import { 
  createSharedWidget, 
  getUserSharedWidgets, 
  getPublicSharedWidgets 
} from "@/lib/sharing"

const createWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  widgetType: z.string().min(1),
  config: z.record(z.any()),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const url = new URL(req.url)
    const type = url.searchParams.get("type")
    const search = url.searchParams.get("search")
    const limit = parseInt(url.searchParams.get("limit") || "20")
    const offset = parseInt(url.searchParams.get("offset") || "0")

    if (type === "public") {
      // Get public widgets
      const widgets = await getPublicSharedWidgets(limit, offset, search || undefined)
      return jsonOK(widgets)
    } else if (session?.user?.id) {
      // Get user's widgets
      const widgets = await getUserSharedWidgets(session.user.id)
      return jsonOK(widgets)
    } else {
      return jsonError("Unauthorized", 401)
    }
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
    const parsed = createWidgetSchema.safeParse(body)
    
    if (!parsed.success) {
      return jsonError("Invalid payload", 400, "VALIDATION_ERROR")
    }

    const widget = await createSharedWidget(session.user.id, parsed.data)
    return jsonOK(widget)
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
