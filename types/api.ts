export type MarketcapResponse = { ok: true; data: { cap: number } } | { ok: false; error: string }
export type DonationsResponse = { ok: true; data: { total: number } } | { ok: false; error: string }
export type BuysResponse = { ok: true; data: { buys: { user: string; amount: number }[] } } | { ok: false; error: string }
export type ChatResponse = { ok: true; data: { messages: { user: string; text: string }[] } } | { ok: false; error: string }
export type BurnResponse = { ok: true; data: { burn: number } } | { ok: false; error: string }
export type MetricsResponse = { ok: true; data: { trend: number[]; distribution: number[]; notifications: string[] } } | { ok: false; error: string }


