import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export function middleware(req: NextRequest) {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "anon"
  const ok = rateLimit(String(ip), 60, 60_000)
  if (!ok) {
    logger.warn("Rate limited", { ip, path: req.nextUrl.pathname })
    return NextResponse.json({ ok: false, error: "Too Many Requests" }, { status: 429 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}


