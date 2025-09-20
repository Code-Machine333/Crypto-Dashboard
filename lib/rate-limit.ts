const buckets = new Map<string, { tokens: number; updatedAt: number }>()

export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now()
  const refillRate = limit / windowMs
  const entry = buckets.get(key) || { tokens: limit, updatedAt: now }
  const elapsed = now - entry.updatedAt
  entry.tokens = Math.min(limit, entry.tokens + elapsed * refillRate)
  entry.updatedAt = now
  if (entry.tokens < 1) {
    buckets.set(key, entry)
    return false
  }
  entry.tokens -= 1
  buckets.set(key, entry)
  return true
}


