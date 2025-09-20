import { jsonOK } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  const base = 250_000
  const drift = Math.round((Math.random() - 0.5) * 5_000)
  return jsonOK({ cap: base + drift })
}


