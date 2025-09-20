import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function sseHeaders() {
	return new Headers({
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive",
		"X-Accel-Buffering": "no",
	})
}

function writeEvent(controller: ReadableStreamDefaultController, data: unknown, event?: string) {
	const payload = `data: ${JSON.stringify(data)}\n\n`
	const named = event ? `event: ${event}\n${payload}` : payload
	controller.enqueue(new TextEncoder().encode(named))
}

// Mock generators per topic
function genMarketcap() {
	return {
		token: "PUMP",
		price: +(0.0005 + Math.random() * 0.0002).toFixed(8),
		fdv: Math.floor(1_000_000 + Math.random() * 250_000),
		mc: Math.floor(750_000 + Math.random() * 200_000),
		updatedAt: Date.now(),
	}
}

function genDonations() {
	return {
		totalUsd: +(5000 + Math.random() * 500).toFixed(2),
		lastDonation: {
			user: `user${Math.floor(Math.random() * 999)}`,
			amountUsd: +(5 + Math.random() * 50).toFixed(2),
			message: "Great stream!",
		},
		updatedAt: Date.now(),
	}
}

function genBuys() {
	return {
		buyCount1m: Math.floor(5 + Math.random() * 10),
		volume1m: +(100 + Math.random() * 400).toFixed(2),
		lastBuy: {
			wallet: `0x${Math.random().toString(16).slice(2, 8)}...`,
			amount: +(0.1 + Math.random() * 2).toFixed(3),
		},
		updatedAt: Date.now(),
	}
}

function genChat() {
	const samples = ["Wen moon?", "Nice buy!", "GM", "Giga pump", "LFG 🚀"]
	return {
		message: samples[Math.floor(Math.random() * samples.length)],
		user: `anon${Math.floor(Math.random() * 9999)}`,
		updatedAt: Date.now(),
	}
}

function genBurn() {
	return {
		burned: Math.floor(10_000 + Math.random() * 5_000),
		goal: 50_000,
		progress: +(Math.random()).toFixed(3),
		updatedAt: Date.now(),
	}
}

const topicToGenerator: Record<string, () => unknown> = {
	marketcap: genMarketcap,
	donations: genDonations,
	buys: genBuys,
	chat: genChat,
	burn: genBurn,
}

export async function GET(_req: NextRequest, { params }: { params: { topic: string } }) {
	const { topic } = params
	if (!topicToGenerator[topic]) {
		return new Response(JSON.stringify({ error: "Unknown topic" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		})
	}

	const stream = new ReadableStream({
		start(controller) {
			const gen = topicToGenerator[topic]
			// Send a welcome event
			writeEvent(controller, { ok: true, topic, now: Date.now() }, "open")
			// Heartbeat to keep connection alive for proxies
			const heartbeat = setInterval(() => {
				writeEvent(controller, { type: "ping", t: Date.now() }, "heartbeat")
			}, 15_000)
			// Data interval
			const interval = setInterval(() => {
				writeEvent(controller, gen(), topic)
			}, 2_000)

			// Cleanup on close
			const cancel = () => {
				clearInterval(interval)
				clearInterval(heartbeat)
				try {
					controller.close()
				} catch {}
			}

			// Some runtimes provide global AbortSignal
			// @ts-ignore
			if (typeof _req?.signal !== "undefined") {
				// @ts-ignore
				_req.signal.addEventListener("abort", cancel)
			}
		},
	})

	return new Response(stream, { headers: sseHeaders() })
}
