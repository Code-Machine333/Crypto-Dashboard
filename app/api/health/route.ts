import { NextResponse } from "next/server"
import { getEnv } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET() {
  const env = getEnv()
  return NextResponse.json({ status: "ok", app: env.NEXT_PUBLIC_APP_NAME, env: env.NODE_ENV, time: new Date().toISOString() })
}


