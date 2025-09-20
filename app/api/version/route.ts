import { NextResponse } from "next/server"
import pkg from "../../../package.json" assert { type: "json" }

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ version: (pkg as any).version || "0.0.0" })
}


