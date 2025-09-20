import { NextRequest } from "next/server"
import { getAnalyticsSummary } from "@/lib/analytics"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get("days") || "30")
    
    const summary = await getAnalyticsSummary(session.user.id, days)
    
    if (!summary) {
      return jsonError("Failed to fetch analytics", 500)
    }

    return jsonOK(summary)
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
