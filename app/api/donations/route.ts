import { jsonOK } from "@/lib/http"

export const dynamic = "force-dynamic"

let total = 0

export async function GET() {
  total += Math.random() * 0.05
  return jsonOK({ total: Number(total.toFixed(3)) })
}


