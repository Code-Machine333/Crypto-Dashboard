import { jsonOK } from "@/lib/http"

export const dynamic = "force-dynamic"

let seed = 100

export async function GET() {
  // Simple deterministic-ish drift for mock charts
  seed += Math.floor((Math.random() - 0.4) * 8)
  const trend = Array.from({ length: 10 }, (_, i) => Math.max(10, (seed + i * 5) % 100))
  const distribution = [
    Math.max(10, 50 + Math.floor(Math.random() * 20) - 10),
    Math.max(10, 30 + Math.floor(Math.random() * 20) - 10),
    Math.max(10, 20 + Math.floor(Math.random() * 20) - 10),
  ]
  const notifications = [
    "Donation goal reached",
    "New preset saved",
    "Buy Bot spiked 20%",
  ]
  return jsonOK({ trend, distribution, notifications })
}


