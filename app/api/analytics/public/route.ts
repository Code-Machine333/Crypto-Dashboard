import { NextRequest } from "next/server"
import { getPublicAnalytics } from "@/lib/analytics"
import { jsonOK, jsonError } from "@/lib/http"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get("days") || "7")
    
    const analytics = await getPublicAnalytics(days)
    
    if (!analytics) {
      return jsonError("Failed to fetch public analytics", 500)
    }

    return jsonOK(analytics)
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
