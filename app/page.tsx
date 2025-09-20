"use client"

import React from "react"
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, CartesianGrid, ComposedChart, Area } from "recharts"
import { Button } from "@/components/ui/button"
import { Send, Bird, Bot, TrendingUp, MessageCircle, Heart, Flame, Clock, Zap, LinkIcon, Diamond, Sparkles, Shield, Cpu } from "lucide-react"
import Link from "next/link"

export default function StreamDotFunLanding() {
  const [metrics, setMetrics] = React.useState<{ trend: number[]; distribution: number[]; notifications: string[] } | null>(null)
  const [paused, setPaused] = React.useState(false)
  const tlRef = React.useRef<HTMLDivElement | null>(null)
  const brRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch('/api/metrics', { cache: 'no-store' })
        const json = await res.json()
        if (alive) setMetrics(json)
      } catch {}
    }
    load()
    let id: any
    if (!paused) id = setInterval(load, 4000)
    return () => { alive = false; if (id) clearInterval(id) }
  }, [paused])

  React.useEffect(() => {
    let raf: number | null = null
    const update = () => {
      const y = typeof window !== 'undefined' ? window.scrollY : 0
      const shift = Math.min(60, y * 0.06)
      if (tlRef.current) tlRef.current.style.transform = `translate3d(0, ${shift}px, 0) rotate(-18deg)`
      if (brRef.current) brRef.current.style.transform = `translate3d(0, ${-shift}px, 0) rotate(18deg)`
    }
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const LineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#fb923c' }} />
            <span style={{ color: '#fff', fontSize: 12 }}>Value: {payload[0].value}</span>
          </div>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0]
      return (
        <div style={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: p.color }} />
            <span style={{ color: '#fff', fontSize: 12 }}>{p.name}: {p.value}</span>
          </div>
        </div>
      )
    }
    return null
  }

  const LineLegend = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, color: '#bbb', fontSize: 12 }}>
      <span style={{ width: 14, height: 2, background: '#fb923c', display: 'inline-block', borderRadius: 2 }} />
      <span>Trend</span>
    </div>
  )
  const widgets = [
    { icon: TrendingUp, name: "Market Cap", description: "Live cap, goals, and progress", href: "/configure?widget=market-cap" },
    { icon: Heart, name: "Donations", description: "Tipping with QR + quick amounts", href: "/configure?widget=donations" },
    { icon: Bot, name: "Buy Bot", description: "Live buy feed with animations", href: "/configure?widget=buy-bot" },
    { icon: MessageCircle, name: "Chat Widget", description: "Clean chat overlay for streams", href: "/configure?widget=chat-widget" },
    { icon: Flame, name: "Burn Goals", description: "Burn progress with milestones", href: "/configure?widget=burn-goals" },
    { icon: Clock, name: "Subathon Timer", description: "Reactive timed events", href: "/configure?widget=subathon" },
  ]

  const features = [
    { icon: Zap, title: "Real-time", description: "Low-latency polling, smooth updates" },
    { icon: LinkIcon, title: "Drop-in", description: "URL widgets for OBS/Streamlabs" },
    { icon: Diamond, title: "Creator-first", description: "Crafted for pump.fun streams" },
    { icon: Shield, title: "Resilient", description: "Safe fallbacks and offline modes" },
    { icon: Cpu, title: "Performant", description: "GPU-friendly visuals and effects" },
    { icon: Sparkles, title: "Stylish", description: "Tasteful gradients and motion" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="mesh-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0">
        <div ref={tlRef}
          className="absolute opacity-[0.05] bg-no-repeat bg-contain"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d0975fda-cac3-49b8-9344-375ae414ace1-1J1cNtltc4rpVQXZZIUqRcoQjjBirX.webp)",
            width: "48vw",
            maxWidth: 720,
            aspectRatio: "1 / 1",
            top: "-10%",
            left: "-8%",
            filter: "saturate(0.9)"
          }}
        />
        <div
          className="absolute inset-0 m-auto opacity-[0.04] bg-no-repeat bg-contain"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d0975fda-cac3-49b8-9344-375ae414ace1-1J1cNtltc4rpVQXZZIUqRcoQjjBirX.webp)",
            width: "36vw",
            maxWidth: 560,
            aspectRatio: "1 / 1",
            filter: "saturate(0.9)"
          }}
        />
        <div ref={brRef}
          className="absolute opacity-[0.05] bg-no-repeat bg-contain"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d0975fda-cac3-49b8-9344-375ae414ace1-1J1cNtltc4rpVQXZZIUqRcoQjjBirX.webp)",
            width: "48vw",
            maxWidth: 720,
            aspectRatio: "1 / 1",
            bottom: "-12%",
            right: "-10%",
            filter: "saturate(0.9)"
          }}
        />
        {/* Right-side logo accent near widgets */}
        <div
          className="absolute opacity-[0.06] bg-no-repeat bg-contain logo-glow"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d0975fda-cac3-49b8-9344-375ae414ace1-1J1cNtltc4rpVQXZZIUqRcoQjjBirX.webp)",
            width: "26vw",
            maxWidth: 420,
            aspectRatio: "1 / 1",
            top: "10%",
            right: "5%",
            transform: "rotate(10deg)",
            filter: "saturate(0.9)"
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d0975fda-cac3-49b8-9344-375ae414ace1-1J1cNtltc4rpVQXZZIUqRcoQjjBirX.webp"
              alt="Streamertools.fun"
              className="w-9 h-9 rounded-md ring-1 ring-white/10 group-hover:scale-105 transition"
            />
            <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              streamertools.fun
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-2 py-1 glass rounded-xl border border-white/10">
            <Link href="/explore" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Explore</Link>
            <span className="h-5 w-px bg-white/10" />
            <Link href="/configure" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Configure</Link>
            <span className="h-5 w-px bg-white/10" />
            <Link href="/documentation" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Docs</Link>
        </div>

          <div className="flex items-center gap-2">
            <Link href="/configure">
              <Button size="sm" className="rounded-full px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/10">
                Launch Builder
            </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white hover:bg-white/5"
              onClick={() => {
                if (typeof document !== 'undefined') {
                  const el = document.documentElement
                  el.classList.toggle('dark')
                }
              }}
            >
              Theme
            </Button>
          </div>
        </nav>
        <div className="pointer-events-none h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="px-6 pt-16 pb-10 group">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300 mb-4">
                <Sparkles className="w-4 h-4" /> Live, stylish widgets for pump.fun creators
        </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white">
                Power your stream with beautiful, real-time crypto widgets
              </h1>
              <p className="mt-5 text-gray-300 text-lg leading-relaxed">
                Drop-in overlays for OBS and Streamlabs. Encode configs, share presets, and grow your community with clarity and style.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/configure">
                  <Button size="lg" className="px-7 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">Start Building</Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" size="lg" className="px-7 border-white/20 text-white hover:bg-white/5">Browse Widgets</Button>
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="glass p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">10K+</div>
                  Creators
                </div>
                <div className="glass p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">99.9%</div>
                  Uptime
                </div>
                <div className="glass p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">5m</div>
                  Setup Time
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_0_120px_-40px_rgba(251,146,60,0.6)] group/widgets"
                   onMouseEnter={() => {
                     const el = document.querySelector('.logo-glow') as HTMLElement | null
                     if (el) el.classList.add('logo-glow-pulse')
                   }}
                   onMouseLeave={() => {
                     const el = document.querySelector('.logo-glow') as HTMLElement | null
                     if (el) el.classList.remove('logo-glow-pulse')
                   }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {widgets.map((w, i) => (
                    <Link key={i} href={w.href} className="block group">
                      <div className="glass rounded-xl p-4 h-32 flex items-start gap-3 group-hover:border-orange-500/40 transition border border-white/10">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/70 to-amber-400/70 grid place-items-center">
                          <w.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{w.name}</div>
                          <div className="text-xs text-gray-300/80 mt-1">{w.description}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Strip */}
        <section className="px-6 py-12 border-t border-b border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center border border-white/10">
                  <f.icon className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{f.title}</div>
                  <div className="text-xs text-gray-400">{f.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Essentials Preview */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Dashboard Essentials</h2>
              <div className="text-sm text-gray-400">Preview of core building blocks</div>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
              <div className="text-sm text-gray-300">Filters:</div>
              <select className="bg-black/40 border border-white/10 text-xs text-gray-300 rounded-md px-2 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
              <select className="bg-black/40 border border-white/10 text-xs text-gray-300 rounded-md px-2 py-1">
                <option>All widgets</option>
                <option>Market Cap</option>
                <option>Donations</option>
                <option>Buy Bot</option>
              </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[{t:'Revenue',v:'$2,947',sub:'+12% WoW',c:'text-green-400'},
                {t:'Active Users',v:'1,284',sub:'+4.3%',c:'text-orange-300'},
                {t:'Engagement',v:'67%',sub:'+2.1%',c:'text-orange-300'},
                {t:'Uptime',v:'99.9%',sub:'24h',c:'text-green-400'}].map((k,i)=> (
                <div key={i} className="crypto-card p-4">
                  <div className="text-xs text-gray-400">{k.t}</div>
                  <div className={`text-2xl font-bold mt-1 ${k.c}`}>{k.v}</div>
                  <div className="text-xs text-gray-500 mt-1">{k.sub}</div>
                </div>
              ))}
          </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div
                className="crypto-card p-4 hover-glow focus-ring"
                tabIndex={0}
                title={paused ? 'Updates paused — press Space to resume' : 'Press Space to pause updates'}
                onKeyDown={(e) => {
                  if (e.code === 'Space') {
                    e.preventDefault()
                    setPaused((p) => !p)
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/90">Trend</div>
                  <div className="text-xs text-orange-300">{paused ? 'Paused' : 'Live'}</div>
                </div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={(metrics?.trend || [40,55,35,70,60,85,72,78,90,75]).map((v, i) => ({ i, v }))} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fb923c" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#ffffff12" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="v" stroke="none" fill="url(#trendFill)" />
                      <Line type="monotone" dataKey="v" name="Trend" stroke="#fb923c" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1 }} />
                      <Tooltip content={<LineTooltip />} cursor={{ stroke: "#ffffff22" }} />
                      <Legend verticalAlign="bottom" align="left" content={<LineLegend />} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="crypto-card p-4 hover-glow focus-ring" tabIndex={0}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/90">Distribution</div>
                  <div className="text-xs text-gray-400">By widget</div>
                  </div>
                <div className="flex items-center gap-4">
                  <div className="w-[140px] h-[140px]">
                    <PieChart width={140} height={140}>
                      <Pie cx="50%" cy="50%" isAnimationActive animationDuration={600} data={(metrics?.distribution || [60,25,15]).map((v,i)=>({name:['Market Cap','Donations','Buy Bot'][i], value:v}))} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={2}>
                        {["#fb923c", "#f59e0b", "#fbbf24"].map((c,i)=> <Cell key={i} fill={c} stroke="#00000080" />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </div>
                  <div className="text-xs text-gray-300 space-y-1">
                    {['Market Cap','Donations','Buy Bot'].map((l,i)=> (
                      <div key={i} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{background: ["#fb923c", "#f59e0b", "#fbbf24"][i]}} /> {l}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="crypto-card p-4 hover-glow focus-ring" tabIndex={0}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/90">Notifications</div>
                  <div className="text-xs text-green-400">{metrics?.notifications?.length || 3} new</div>
                </div>
                <div className="space-y-2 text-xs text-gray-300">
                  {(metrics?.notifications || ['Donation goal reached','New preset saved','Buy Bot spiked 20%']).map((n,i)=> (
                    <div key={i} className="glass rounded px-2 py-2 border border-white/10">{n}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="crypto-card p-4 overflow-x-auto">
              <div className="text-sm text-white/90 mb-3">Recent Activity</div>
              <table className="w-full text-xs text-gray-300">
                <thead className="text-gray-400">
                  <tr className="text-left">
                    <th className="py-2">Time</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Detail</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {t:'2m ago',y:'Donation',d:'0.5 SOL to @creator',s:'Processed'},
                    {t:'8m ago',y:'Buy',d:'$350 Buy Bot trigger',s:'OK'},
                    {t:'15m ago',y:'Preset',d:'Saved "Launch Day"',s:'Saved'},
                  ].map((r,i)=> (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-2">{r.t}</td>
                      <td className="py-2">{r.y}</td>
                      <td className="py-2">{r.d}</td>
                      <td className="py-2 text-green-400">{r.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      </section>

        {/* Showcase Widgets */}
        <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold">Widget Showcase</h2>
              <Link href="/explore" className="text-sm text-orange-300 hover:text-orange-200">See all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgets.map((w, i) => (
                <Link key={i} href={w.href} className="group">
                  <div className="crypto-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 grid place-items-center">
                        <w.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-white font-semibold">{w.name}</div>
                    </div>
                    <div className="text-sm text-gray-300/90 mb-4">{w.description}</div>
                    <div className="text-xs text-orange-300">Configure →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="px-6 py-12 border-t border-white/10 noise-bg">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Integrations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "OBS", hint: "Browser Source" },
                { name: "Streamlabs", hint: "Overlay URL" },
                { name: "Twitch", hint: "Chat Overlay" },
                { name: "YouTube", hint: "Live Chat" },
              ].map((i, k) => (
                <div key={k} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="text-white font-medium">{i.name}</div>
                  <div className="text-xs text-gray-400">{i.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Roadmap</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="animated-border rounded-2xl p-5">
                <div className="text-white font-semibold mb-2">Presets Cloud</div>
                <div className="text-sm text-gray-400">Sync and share presets across devices with links.</div>
              </div>
              <div className="animated-border rounded-2xl p-5">
                <div className="text-white font-semibold mb-2">Theme Studio</div>
                <div className="text-sm text-gray-400">Fine control over typography, motion, and glow.</div>
              </div>
              <div className="animated-border rounded-2xl p-5">
                <div className="text-white font-semibold mb-2">Real APIs</div>
                <div className="text-sm text-gray-400">Swap mock routes for your data sources instantly.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Strip */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {["“Set up in minutes, looks pro.”","“Market cap widget keeps chat buzzing.”","“Donations doubled with QR.”"].map((t, i) => (
                <div key={i} className="glass rounded-xl p-4 text-gray-300">{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles (Project Ideology) */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Principles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="crypto-card p-6">
                <div className="text-white font-semibold mb-2">Creator-first</div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"></span> URL-based widgets that drop into OBS/Streamlabs with no lock-in</li>
                  <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"></span> Presets you can copy, share, and remix</li>
                  <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"></span> Typography and motion you control</li>
                </ul>
              </div>
              <div className="crypto-card p-6">
                <div className="text-white font-semibold mb-2">Resilient by design</div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"></span> Offline-first QR with CDN fallback</li>
                  <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"></span> Safe fallbacks for real-time polling</li>
                  <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"></span> Fast, GPU-friendly effects</li>
              </ul>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/documentation" className="text-sm text-orange-300 hover:text-orange-200">Read the full ethos →</Link>
            </div>
          </div>
        </section>

        {/* Creator Playbooks */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-bold">Creator Playbooks</h3>
              <Link href="/documentation" className="text-sm text-orange-300 hover:text-orange-200">See guides →</Link>
                  </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[{
                title: "Launch Day Overlay",
                desc: "Market Cap + Buy Bot + QR donations",
              }, {
                title: "Community Night",
                desc: "Chat Widget + Goal Chips + Ticker",
              }, {
                title: "Burn Party",
                desc: "Burn Goals + Subathon Timer",
              }].map((p, i) => (
                <div key={i} className="crypto-card p-5">
                  <div className="text-white font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-300 mt-1">{p.desc}</div>
                  <div className="mt-4 text-xs text-orange-300">Open preset →</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Overlay Demo Reel */}
        <section className="px-6 pb-24 relative">
          <div className="orb" style={{ top: 0, right: 60 }} />
          <div className="orb" style={{ bottom: -40, left: 40 }} />
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5" />
              <div className="relative z-10">
                <div className="grid md:grid-cols-3 gap-6">
                  {["/widget/market-cap","/widget/buy-bot","/widget/burn-goals"].map((href, i) => (
                    <Link key={i} href={href} className="block group">
                      <div className="glass rounded-2xl p-6 h-44 shimmer hover-glow transition-all duration-300 flex flex-col justify-between border border-white/10 group-hover:border-orange-500/30">
                        <div>
                          <div className="text-white font-bold text-base mb-2">Live Preview</div>
                          <div className="text-sm text-gray-300/90">Opens overlay in new tab</div>
                        </div>
                        <div className="flex justify-end">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 glow-ring flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <div className="w-6 h-6 rounded-full bg-white/20" />
                          </div>
                        </div>
                  </div>
                    </Link>
                  ))}
                  </div>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm text-orange-300">
                    <Sparkles className="w-4 h-4" />
                    Tip: pass ?cfg= to load a preset config
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        {/* Closing CTA */}
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-orange-500/10 to-amber-500/15 backdrop-blur-sm p-10 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-sm text-orange-200 mb-6">
                  <Zap className="w-4 h-4" />
                  Ready to launch?
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent">
                  Build your streaming toolkit today
                </h3>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                  Design, share, and launch overlays in minutes. No lock-in, just clean links.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/configure">
                    <Button size="lg" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105">
                      <Zap className="w-5 h-5 mr-2" />
                      Open Builder
                    </Button>
                  </Link>
                  <Link href="/documentation">
                    <Button variant="outline" size="lg" className="px-8 py-4 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                      <Shield className="w-5 h-5 mr-2" />
                      Read Docs
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 text-sm text-gray-400">
                  Join <span className="text-orange-300 font-semibold">10,000+</span> creators already building
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-orange-500/30 bg-gradient-to-t from-black via-black/80 to-black/40 shadow-[0_-20px_60px_rgba(251,146,60,0.15)]">
        <div className="pointer-events-none absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
        <div className="orb" style={{ bottom: -60, right: 120 }} />
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d0975fda-cac3-49b8-9344-375ae414ace1-1J1cNtltc4rpVQXZZIUqRcoQjjBirX.webp"
                alt="logo"
                className="w-8 h-8 rounded-sm ring-1 ring-white/10"
              />
              <div className="text-white font-semibold">streamertools.fun</div>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">Creator-grade overlays for pump.fun. Built for clarity, speed, and style.</p>
            <div className="mt-4">
              <div className="text-white font-medium mb-2 text-sm">Subscribe for updates</div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@domain.com"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-orange-400"
                />
                <Button className="px-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">Join</Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">No spam. Unsubscribe anytime.</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-medium mb-3">Product</div>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/explore" className="text-gray-400 hover:text-white">Explore</Link>
                <Link href="/configure" className="text-gray-400 hover:text-white">Builder</Link>
                <Link href="/documentation" className="text-gray-400 hover:text-white">Docs</Link>
              </div>
            </div>
            <div>
              <div className="text-white font-medium mb-3">Community</div>
              <div className="flex items-center gap-2 text-sm">
                <Send className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Telegram</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-2">
                <Bird className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">X (Twitter)</span>
              </div>
            </div>
            <div>
              <div className="text-white font-medium mb-3">Resources</div>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link>
                <Link href="/tutorials" className="text-gray-400 hover:text-white">Tutorials</Link>
                <Link href="/examples" className="text-gray-400 hover:text-white">Examples</Link>
                <Link href="/community" className="text-gray-400 hover:text-white">Community</Link>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 md:text-right">
            <div>© 2025 streamertools.fun</div>
            <div className="mt-2 flex md:justify-end gap-3">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/changelog" className="hover:text-white">Changelog</Link>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> Status: Operational
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span>Made with ❤️ for creators</span>
              <span className="text-white/20">•</span>
              <span>Powered by Next.js</span>
            </div>
            <div className="text-white/50">v0.1.0</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
