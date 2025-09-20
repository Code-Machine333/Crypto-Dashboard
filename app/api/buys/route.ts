import { jsonOK } from "@/lib/http"

export const dynamic = "force-dynamic"

const names = ["Yje2ax","CryptoChad","DiamondHands","PepeLover"]

export async function GET() {
  const buys = Array.from({ length: 3 }).map(() => ({
    user: names[Math.floor(Math.random() * names.length)],
    amount: Math.round(100 + Math.random() * 1000),
  }))
  return jsonOK({ buys })
}


