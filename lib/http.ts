import { NextResponse } from "next/server"

type Ok<T> = { ok: true; data: T }
type Fail = { ok: false; error: string; code?: string }

export function jsonOK<T>(data: T, status?: number) {
  return NextResponse.json<Ok<T>>({ ok: true, data }, { status: status || 200 })
}

export function jsonError(message: string, status?: number, code?: string) {
  return NextResponse.json<Fail>({ ok: false, error: message, code }, { status: status || 400 })
}

export function tryCatch<T>(fn: () => Promise<T>) {
  return fn().then((data) => jsonOK(data)).catch((e: any) => jsonError(e?.message || "Internal Error", 500))
}


