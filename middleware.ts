import { NextResponse } from "next/server"

// Temporarily disable authentication middleware to fix server errors
export function middleware(req: any) {
  // Allow all routes for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Temporarily disable all middleware matching
  ]
}
