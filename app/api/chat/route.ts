import { jsonOK } from "@/lib/http"

export const dynamic = "force-dynamic"

const pool = [
  { user: "DiamondHands", text: "Paper hands get rekt." },
  { user: "CryptoChad", text: "This is going to the moon!" },
  { user: "PepeLover", text: "WAGMI" },
  { user: "WhaleWatcher", text: "Big buys coming in." },
]

export async function GET() {
  const messages = Array.from({ length: 5 }).map(() => pool[Math.floor(Math.random() * pool.length)])
  return jsonOK({ messages })
}


