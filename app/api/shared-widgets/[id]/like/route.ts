import { NextRequest } from "next/server"
import { jsonOK, jsonError } from "@/lib/http"
import { likeWidget } from "@/lib/sharing"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await likeWidget(params.id)
    return jsonOK({ liked: true })
  } catch (error: any) {
    return jsonError(error?.message || "Internal Error", 500)
  }
}
