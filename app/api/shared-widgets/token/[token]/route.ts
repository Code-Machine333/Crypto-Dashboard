import { NextRequest } from "next/server"
import { jsonOK, jsonError } from "@/lib/http"
import { getSharedWidgetByToken } from "@/lib/sharing"

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const widget = await getSharedWidgetByToken(params.token)
    
    if (!widget) {
      return jsonError("Widget not found", 404)
    }

    return jsonOK(widget)
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
