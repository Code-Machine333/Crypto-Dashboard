import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { getWebhookLogs } from "@/lib/webhooks"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get("limit") || "50")

    const logs = await getWebhookLogs(session.user.id, params.id, limit)
    return jsonOK(logs)
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
