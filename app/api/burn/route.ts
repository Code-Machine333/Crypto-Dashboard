import { jsonOK } from "@/lib/http"

export const dynamic = "force-dynamic"

let burned = 500_000

export async function GET() {
  burned += Math.round(Math.random() * 5000)
  return jsonOK({ burn: burned })
}


