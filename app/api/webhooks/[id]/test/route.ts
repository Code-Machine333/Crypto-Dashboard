import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonOK, jsonError } from "@/lib/http"
import { testWebhook } from "@/lib/webhooks"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401)
    }

    const result = await testWebhook(params.id)
    return jsonOK(result)
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
