"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useSSE } from "@/hooks/use-sse"
// import { useAnalytics } from "@/hooks/use-analytics"

type Cfg = Record<string, any>

export default function WidgetRuntime({ params }: { params: { section: string } }) {
  const sp = useSearchParams()
  const [cfg, setCfg] = useState<Cfg | null>(null)
  // const { trackView, trackInteraction } = useAnalytics()

  // decode ?cfg= base64 JSON
  useEffect(() => {
    const encoded = sp.get("cfg") || ""
    if (!encoded) return
    try {
      const json = decodeURIComponent(escape(window.atob(encoded)))
      const parsed = JSON.parse(json)
      setCfg(parsed)
    } catch {
      setCfg(null)
    }
  }, [sp])

  // Track widget view (temporarily disabled)
  // useEffect(() => {
  //   if (cfg && params.section) {
  //     trackView(params.section, undefined, {
  //       hasConfig: !!cfg,
  //       configKeys: Object.keys(cfg),
  //     })
  //   }
  // }, [cfg, params.section, trackView])

  const typography = cfg?.typography || {}
  const animation = cfg?.animation || {}
  const branding = cfg?.branding || {}
  const qr = cfg?.qr || {}

  const containerStyle = useMemo(() => ({
    fontFamily: typography.typoFont,
    fontWeight: typography.typoWeight as any,
    letterSpacing: typeof typography.typoTracking === "number" ? `${typography.typoTracking}px` : undefined,
  }), [typography])

  const animStyleName = (animation.animStyle as string) || "fade"
  const animSpeed = animation.animSpeed || 0.6

  // QR URL builder (fallback to remote API)
  const qrUrl = useMemo(() => {
    if (!qr?.enableQR) return ""
    const hex = (s: string) => (s || "").replace(/^#/, "") || "000000"
    const size = Math.max(64, Math.min(512, qr.qrSize || 96))
    const data = qr.qrMode === "donations"
      ? (cfg?.donations?.customDonationUrl || cfg?.donations?.walletAddress || "https://streamertools.fun/donate")
      : (qr.qrCustomUrl || "https://streamertools.fun")
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=${hex(qr.qrColor || "#000000")}&bgcolor=${hex(qr.qrBg || "#ffffff")}`
  }, [qr, cfg])

  // Helpers for market cap UI
  const goals = (cfg?.marketCapGoals as Array<{ goal: string; text: string }>) || []
  const numericGoals = goals
    .map((g) => ({ goal: Number(g.goal || 0), text: g.text || "" }))
    .filter((g) => g.goal > 0)
    .sort((a, b) => a.goal - b.goal)
  const initialCap = Number((cfg as any)?.currentCap ?? (cfg as any)?.chart?.currentCap ?? 250000)
  const [liveCap, setLiveCap] = useState<number>(initialCap)
  
  // Real-time market cap data via SSE
  const { data: marketCapData } = useSSE(
    params.section === "market-cap" ? "/api/stream/marketcap" : "",
    {
      onMessage: (data) => {
        if (data.mc && typeof data.mc === "number") {
          setLiveCap(data.mc)
        }
      }
    }
  )

  const topGoal = numericGoals[numericGoals.length - 1]?.goal || Math.max(1, liveCap)
  const pct = Math.max(0, Math.min(100, (liveCap / topGoal) * 100))

  // Subathon timer helpers
  const subCfg = (cfg?.subathon as any) || {}
  const baseSeconds = Math.max(0,
    (parseInt(subCfg.timerHours || "0") || 0) * 3600 +
    (parseInt(subCfg.timerMinutes || "0") || 0) * 60 +
    (parseInt(subCfg.timerSeconds || "0") || 0)
  )
  const [secondsLeft, setSecondsLeft] = useState<number>(baseSeconds)
  useEffect(() => {
    if (params.section !== "subathon") return
    setSecondsLeft(baseSeconds)
  }, [baseSeconds, params.section])
  useEffect(() => {
    if (params.section !== "subathon") return
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [params.section])
  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0")
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0")
  const ss = String(secondsLeft % 60).padStart(2, "0")

  // Donations total via SSE
  const [donTotal, setDonTotal] = useState<number>(0)
  const { data: donationsData } = useSSE(
    params.section === "donations" ? "/api/stream/donations" : "",
    {
      onMessage: (data) => {
        if (data.totalUsd && typeof data.totalUsd === "number") {
          setDonTotal(data.totalUsd)
        }
      }
    }
  )

  // Buy Bot recent buys via SSE
  type Buy = { user: string; amount: number }
  const [buys, setBuys] = useState<Buy[]>([])
  const { data: buysData } = useSSE(
    params.section === "buy-bot" ? "/api/stream/buys" : "",
    {
      onMessage: (data) => {
        if (data.lastBuy) {
          setBuys((prev) => [
            { user: data.lastBuy.wallet.slice(0, 6), amount: data.lastBuy.amount },
            ...prev
          ].slice(0, 3))
        }
      }
    }
  )

  // Chat messages via SSE
  type Msg = { user: string; text: string }
  const [messages, setMessages] = useState<Msg[]>([])
  const { data: chatData } = useSSE(
    params.section === "chat-widget" ? "/api/stream/chat" : "",
    {
      onMessage: (data) => {
        if (data.message && data.user) {
          setMessages((prev) => [
            ...prev,
            { user: data.user, text: data.message }
          ].slice(-20))
        }
      }
    }
  )

  // Burn goals via SSE
  const [currentBurn, setCurrentBurn] = useState<number>(Number((cfg as any)?.currentBurn ?? (cfg as any)?.burn?.progressBarStart ?? 0))
  const { data: burnData } = useSSE(
    params.section === "burn-goals" ? "/api/stream/burn" : "",
    {
      onMessage: (data) => {
        if (data.burned && typeof data.burned === "number") {
          setCurrentBurn(data.burned)
        }
      }
    }
  )

  return (
    <div className="w-screen h-screen overflow-hidden" style={{ background: "transparent" }}>
      <div
        className={`relative w-full h-full flex items-center justify-center ${animStyleName}-in`}
        style={{ ...containerStyle, animationDuration: `${animSpeed}s` }}
      >
        {/* Minimal demo content by section */}
        {params.section === "market-cap" && (
          <div className="min-w-[520px] max-w-[720px] w-[60vw]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/90 text-sm tracking-wider uppercase">Market Cap</div>
              <div className="text-green-400 text-xs bg-green-400/10 border border-green-400/30 rounded px-2 py-0.5">Live</div>
            </div>
            {/* Current Cap */}
            <div className="rounded-xl border border-orange-500/30 bg-black/50 px-5 py-4 shadow-[0_0_24px_rgba(249,115,22,0.15)]">
              <div className="flex items-end gap-3">
                <div className="text-white text-3xl font-bold">${(liveCap/1e3).toFixed(1)}k</div>
                <div className="text-orange-400 text-sm mb-1">of ${(topGoal/1e3).toFixed(0)}k goal</div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${pct}%` }} />
              </div>
              {/* Goals badges */}
              {numericGoals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {numericGoals.map((g, i) => (
                    <div key={i} className="text-[10px] text-white/90 bg-white/5 border border-white/10 rounded-full px-2 py-1">
                      ${g.goal.toLocaleString()} {g.text && <span className="text-white/50">— {g.text}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {params.section === "buy-bot" && (
          <div className="bg-black/50 border border-orange-500/30 rounded-2xl px-6 py-5 shadow-[0_0_24px_rgba(249,115,22,0.2)] min-w-[420px]">
            <div className="text-white/80 text-sm tracking-wider uppercase mb-2">Live Buys</div>
            <div className="space-y-3">
              {(buys.length ? buys : [{ user: "Yje2ax", amount: Number((cfg?.buyAmounts?.[0] || 500)) }]).map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
                  <div>
                    <div className="text-white font-semibold">{b.user}</div>
                    <div className="text-white/70 text-sm">bought {b.amount} USD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {params.section === "chat-widget" && (
          <div className="w-[520px] h-[380px] rounded-2xl bg-white p-4 overflow-y-auto">
            {(messages.length ? messages : [
              { user: "DiamondHands", text: "Paper hands get rekt." },
              { user: "CryptoChad", text: "This is going to the moon!" },
              { user: "PepeLover", text: "WAGMI" },
            ]).map((m, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                {!cfg?.chat?.removeAvatars && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${i%3===0?"bg-gray-600":i%3===1?"bg-purple-500":"bg-green-500"}`}>
                    <span className="text-white text-[10px] font-bold">{m.user[0]}</span>
                  </div>
                )}
                <div className="bg-gray-100 rounded-lg p-2 flex-1">
                  <div className="text-xs font-medium text-gray-800 mb-0.5">{m.user}</div>
                  <div className="text-xs text-gray-800">{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {params.section === "donations" && (
          <div className="min-w-[420px] max-w-[640px] w-[55vw]">
            <div className="rounded-2xl border border-orange-500/30 bg-black/50 p-6 shadow-[0_0_24px_rgba(249,115,22,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white/90 text-sm tracking-wider uppercase">Donations</div>
                <div className="text-white/60 text-xs">Min: {cfg?.donations?.minDonationAmount || "0"} SOL</div>
              </div>

              <div className="text-white text-xl font-semibold mb-2">Donate to {cfg?.donations?.customDonationUrl || "creator"}</div>
              <div className="text-white/70 text-sm mb-4">Wallet: {(cfg?.donations?.walletAddress || "").slice(0,4)}...{(cfg?.donations?.walletAddress || "").slice(-4) || ""}</div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {["0.1","0.25","0.5"].map((a)=> (
                  <div key={a} className="text-center text-white/90 bg-white/5 border border-white/10 rounded-lg py-2 text-sm">{a} SOL</div>
                ))}
              </div>

              <div className="text-white/70 text-xs">Scan the QR or use the wallet address to donate.</div>
            </div>
          </div>
        )}
        {params.section === "burn-goals" && (
          <div className="min-w-[520px] max-w-[720px] w-[60vw]">
            <div className="rounded-2xl border border-orange-500/30 bg-black/50 p-6 shadow-[0_0_24px_rgba(249,115,22,0.15)]">
              <div className="text-white/90 text-sm tracking-wider uppercase mb-3">Burn Goals</div>
              {(() => {
                const goals = (cfg?.burn?.burnGoals as Array<{goal:string;text:string}>) || []
                const parsed = goals.map(g=>({goal:Number(g.goal||0), text:g.text||""})).filter(g=>g.goal>0)
                const current = currentBurn
                const top = parsed[parsed.length-1]?.goal || Math.max(1,current)
                const pct = Math.max(0, Math.min(100, (current/top)*100))
                return (
                  <>
                    <div className="flex items-end gap-3">
                      <div className="text-white text-2xl font-bold">{current.toLocaleString()} burnt</div>
                      <div className="text-orange-400 text-sm mb-1">of {top.toLocaleString()}</div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    {parsed.length>0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {parsed.map((g,i)=> (
                          <div key={i} className="text-white/90 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
                            <span className="font-semibold">{g.goal.toLocaleString()}</span>{g.text && <span className="text-white/60"> — {g.text}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}
        {params.section === "subathon" && (
          <div className="bg-black/50 border border-green-400/30 rounded-2xl px-8 py-6 shadow-[0_0_24px_rgba(34,197,94,0.2)] text-center">
            <div className="text-white/80 text-sm tracking-wider uppercase mb-2">Subathon</div>
            <div className="text-green-400 font-mono text-5xl font-bold">{hh}:{mm}:{ss}</div>
            <div className="text-white/60 text-xs mt-2">Initial: {String(subCfg.timerHours||0).padStart(2,"0")}h {String(subCfg.timerMinutes||0).padStart(2,"0")}m {String(subCfg.timerSeconds||0).padStart(2,"0")}s</div>
          </div>
        )}

        {/* Watermark */}
        {branding?.showWatermark && (
          <div className="absolute left-3 bottom-3 bg-black/50 border border-gray-700 text-white text-[10px] rounded px-2 py-1 flex items-center gap-2">
            <span className="opacity-80">streamertools.fun</span>
            {(branding?.telegramHandle || branding?.xHandle) && <span className="opacity-40">•</span>}
            {branding?.telegramHandle && <span className="opacity-80">t.me/{branding.telegramHandle}</span>}
            {branding?.xHandle && <span className="opacity-80">x.com/{branding.xHandle}</span>}
          </div>
        )}

        {/* QR overlay */}
        {qr?.enableQR && (
          <div
            className="absolute"
            style={{
              ...(qr.qrPosition === "tl" && { top: 12, left: 12 }),
              ...(qr.qrPosition === "tr" && { top: 12, right: 12 }),
              ...(qr.qrPosition === "bl" && { bottom: 12, left: 12 }),
              ...(qr.qrPosition === "br" && { bottom: 12, right: 12 }),
              width: Math.max(64, Math.min(512, qr.qrSize || 96)),
              height: Math.max(64, Math.min(512, qr.qrSize || 96)),
              borderRadius: qr.qrRadius || 8,
              overflow: "hidden",
              background: qr.qrBg || "#000000",
              display: "grid",
              placeItems: "center",
              padding: 4,
            }}
          >
            <img src={qrUrl} alt="QR" style={{ width: "100%", height: "100%", borderRadius: Math.max(0, (qr.qrRadius || 8) - 2) }} />
          </div>
        )}
      </div>

      {/* Basic keyframes (same names used in /configure preview) */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-in { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes zoom-in { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .fade-in { animation: fade-in ${animSpeed}s ease }
        .slide-in { animation: slide-in ${animSpeed}s ease }
        .zoom-in { animation: zoom-in ${animSpeed}s ease }
      `}</style>
    </div>
  )
}


