"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Heart,
  Flame,
  Clock,
  FileText,
  Send,
  Twitter,
  Play,
  Webhook,
  Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthButton } from "@/components/auth-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAnalytics } from "@/hooks/use-analytics"
import { WidgetTemplates } from "@/components/widget-templates"
import { WidgetTemplate } from "@/lib/widget-templates"
import { WalletSelectionModal } from "@/components/wallet-selection-modal"
import { PortfolioTracker } from "@/components/widgets/portfolio-tracker"
import { PriceAlerts } from "@/components/widgets/price-alerts"
import { WidgetShare } from "@/components/widgets/widget-share"
// import { WidgetThemeSelector } from "@/components/widget-theme-selector"
// import { WidgetExportPanel } from "@/components/widget-export-panel"
// import { WidgetAnimationController } from "@/components/widget-animation-controller"
// import { WidgetSchedulerInterface } from "@/components/widget-scheduler-interface"
// import { WidgetTheme } from "@/lib/widget-themes"
// import { WidgetAnimation } from "@/lib/widget-animations"

// Helper component for navigation items with tooltips
function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  isCollapsed, 
  onClick 
}: { 
  href?: string
  icon: any
  label: string
  isCollapsed: boolean
  onClick?: () => void
}) {
  const content = (
    <div className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${
      isCollapsed ? "justify-center" : ""
    } ${onClick ? "cursor-pointer" : ""}`}>
      <Icon className="w-4 h-4" />
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </div>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {href ? (
              <Link href={href} className="block">
                {content}
              </Link>
            ) : (
              <button onClick={onClick} className="w-full">
                {content}
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return href ? (
    <Link href={href}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className="w-full">
      {content}
    </button>
  )
}

// Helper component for configure section items with tooltips
function ConfigureItem({ 
  icon: Icon, 
  label, 
  subtitle,
  isActive,
  isCollapsed, 
  onClick 
}: { 
  icon: any
  label: string
  subtitle?: string
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}) {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        isActive
          ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      } ${isCollapsed ? "justify-center" : ""}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <div className="text-left">
          <div className="font-medium">{label}</div>
          {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
        </div>
      )}
    </button>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

export default function ConfigurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { trackConfigure, trackPresetSave, trackPresetLoad } = useAnalytics()
  const [activeSection, setActiveSection] = useState("buy-bot")
  const [colorStyle, setColorStyle] = useState("light")
  const [tokenCA, setTokenCA] = useState("")
  const [buyAmounts, setBuyAmounts] = useState(["500", "1000", "2000"])
  const [activeTier, setActiveTier] = useState(1)
  const [selectedAudio, setSelectedAudio] = useState("Off")
  const [audioVolume, setAudioVolume] = useState(100)
  // Buy Bot GIF picker state
  const [gifPreviews, setGifPreviews] = useState<(string | null)[]>(Array(16).fill(null))
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingIndexRef = useRef<number | null>(null)
  const [marketCapGoals, setMarketCapGoals] = useState([
    { goal: "", text: "" },
    { goal: "", text: "" },
    { goal: "", text: "" }
  ])
  const [ttsToken, setTtsToken] = useState("")
  const [chatStyle, setChatStyle] = useState("pump-fun")
  const [removeAvatars, setRemoveAvatars] = useState(false)
  const [widgetWidth, setWidgetWidth] = useState("600")
  const [widgetHeight, setWidgetHeight] = useState("600")
  const [blacklistedWords, setBlacklistedWords] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [minDonationAmount, setMinDonationAmount] = useState("0.01")
  const [customDonationUrl, setCustomDonationUrl] = useState("")
  // Wallet connection state
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState("")
  const [availableTokens, setAvailableTokens] = useState<string[]>([])
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedWalletType, setSelectedWalletType] = useState("")
  const [progressBarStart, setProgressBarStart] = useState("")
  const [burnedTokensIgnore, setBurnedTokensIgnore] = useState("")
  const [burnGoals, setBurnGoals] = useState([
    { goal: "", text: "" },
    { goal: "", text: "" },
    { goal: "", text: "" },
    { goal: "", text: "" },
    { goal: "", text: "" }
  ])
  const [timerHours, setTimerHours] = useState("")
  const [timerMinutes, setTimerMinutes] = useState("")
  const [timerSeconds, setTimerSeconds] = useState("")
  const [timeAddedPerBuy, setTimeAddedPerBuy] = useState("")
  const [timeRemovedPerSell, setTimeRemovedPerSell] = useState("0")
  const [minTransactionValue, setMinTransactionValue] = useState("0")
  // Community & Branding (applies to all widgets)
  const [telegramHandle, setTelegramHandle] = useState("")
  const [xHandle, setXHandle] = useState("")
  const [showWatermark, setShowWatermark] = useState(true)
  // QR Overlay
  const [enableQR, setEnableQR] = useState(false)
  const [qrMode, setQrMode] = useState<"donations" | "custom">("donations")
  const [qrCustomUrl, setQrCustomUrl] = useState("")
  const [qrSize, setQrSize] = useState(96)
  const [qrPosition, setQrPosition] = useState<"tl" | "tr" | "bl" | "br">("br")
  const [qrColor, setQrColor] = useState("#f97316")
  const [qrBg, setQrBg] = useState("#000000")
  const [qrRadius, setQrRadius] = useState(8)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  // Typography
  const [typoFont, setTypoFont] = useState("system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial")
  const [typoWeight, setTypoWeight] = useState(600)
  const [typoTracking, setTypoTracking] = useState(0)
  // Animation tuning (for preview box)
  const [animStyle, setAnimStyle] = useState<"fade" | "slide" | "zoom" | "bounce" | "glow">("fade")
  const [animSpeed, setAnimSpeed] = useState(0.6)
  // Presets (localStorage)
  const [presetName, setPresetName] = useState("")
  const [presetList, setPresetList] = useState<Array<{id: string, name: string, widget: string}>>([])
  const [presetLoading, setPresetLoading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showAnimations, setShowAnimations] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("crypto-orange")
  const [currentAnimation, setCurrentAnimation] = useState<string>("fade-in")
  const brandingRef = useRef<HTMLDivElement | null>(null)
  const monetizationRef = useRef<HTMLDivElement | null>(null)
  const growthRef = useRef<HTMLDivElement | null>(null)
  const widgetPreviewRef = useRef<HTMLDivElement | null>(null)
  // Monetization & Growth toggles
  const [showDonationBadge, setShowDonationBadge] = useState(false)
  const [donationBadgeText, setDonationBadgeText] = useState("Donate")
  const [showGrowthTicker, setShowGrowthTicker] = useState(false)
  const [growthMessage, setGrowthMessage] = useState("Join our Telegram for alpha!")
  const [badgePosition, setBadgePosition] = useState<"tl"|"tr"|"bl"|"br">("br")
  const [badgeColor, setBadgeColor] = useState("#f97316")
  const [tickerPosition, setTickerPosition] = useState<"top"|"bottom">("top")
  const [tickerSpeed, setTickerSpeed] = useState(12)

  const configureItems = [
    { id: "buy-bot", label: "Buy Bot", subtitle: "Real-time buy alerts", icon: TrendingUp },
    { id: "market-cap", label: "Market Cap", subtitle: "Live market data", icon: BarChart3 },
    { id: "chat-widget", label: "Chat Widget", subtitle: "Chat integration", icon: MessageSquare },
    { id: "donations", label: "Donations", subtitle: "Crypto donations", icon: Heart },
    { id: "portfolio-tracker", label: "Portfolio Tracker", subtitle: "Track your investments", icon: BarChart3 },
    { id: "price-alerts", label: "Price Alerts", subtitle: "Get notified of price changes", icon: Clock },
    { id: "widget-share", label: "Widget Share", subtitle: "Share widgets with community", icon: Share2 },
    { id: "burn-goals", label: "Burn Goals", subtitle: "Token burn tracking", icon: Flame },
    { id: "subathon", label: "Subathon", subtitle: "Timer & goals", icon: Clock },
  ]

  const resourceItems = [
    { id: "documentation", label: "Documentation", icon: FileText },
    { id: "telegram", label: "Telegram", icon: Send },
    { id: "twitter", label: "Twitter", icon: Twitter },
  ]

  const advancedItems = [
    { id: "themes", label: "Themes", icon: FileText },
    { id: "animations", label: "Animations", icon: Play },
    { id: "export", label: "Export", icon: Send },
    { id: "scheduler", label: "Scheduler", icon: Clock },
  ]

  // Read ?widget= from URL and activate matching section
  useEffect(() => {
    const w = (searchParams.get("widget") || "").toLowerCase()
    const valid = configureItems.find((i) => i.id === w)
    if (valid && valid.id !== activeSection) {
      setActiveSection(valid.id)
    }
  }, [searchParams])

  // Helper to activate a section and reflect it in the URL
  const activate = (id: string) => {
    setActiveSection(id)
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("widget", id)
    router.replace(`/configure?${sp.toString()}`)
  }

  // Presets: load list from database at mount
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const res = await fetch('/api/presets')
        const data = await res.json()
        if (data.ok) {
          setPresetList(data.data)
        }
      } catch {}
    }
    loadPresets()
  }, [])

  // Try offline QR generation via CDN-loaded library; fall back to remote API in render if not available
  useEffect(() => {
    if (!enableQR) { setQrDataUrl(""); return }
    const hex = (s: string) => (s || "").replace(/^#/, "") || "000000"
    const size = Math.max(64, Math.min(512, qrSize))
    const data = qrMode === "donations"
      ? (customDonationUrl || walletAddress || "https://streamertools.fun/donate")
      : (qrCustomUrl || "https://streamertools.fun")

    const ensureQrLib = (): Promise<any> => {
      if (typeof window === "undefined") return Promise.reject()
      // @ts-ignore
      if (window.QRCode) return Promise.resolve((window as any).QRCode)
      return new Promise((resolve, reject) => {
        const id = "qr-lib-js"
        let script = document.getElementById(id) as HTMLScriptElement | null
        if (!script) {
          script = document.createElement("script")
          script.id = id
          script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"
          script.async = true
          script.onload = () => resolve((window as any).QRCode)
          script.onerror = reject
          document.body.appendChild(script)
        } else {
          script.onload = () => resolve((window as any).QRCode)
        }
      })
    }

    ensureQrLib()
      .then((QRCode: any) => {
        if (!QRCode) return setQrDataUrl("")
        QRCode.toDataURL(data, { width: size, margin: 0, color: { dark: `#${hex(qrColor)}`, light: `#${hex(qrBg)}` } }, (err: any, url: string) => {
          if (err) { setQrDataUrl(""); return }
          setQrDataUrl(url)
        })
      })
      .catch(() => setQrDataUrl(""))

  }, [enableQR, qrMode, qrCustomUrl, customDonationUrl, walletAddress, qrSize, qrColor, qrBg])

  const savePreset = async () => {
    if (!presetName.trim() || presetLoading) return
    setPresetLoading(true)
    try {
      const payload = {
        activeSection,
        colorStyle,
        tokenCA,
        buyAmounts,
        selectedAudio,
        audioVolume,
        marketCapGoals,
        ttsToken,
        chatStyle,
        removeAvatars,
        widgetWidth,
        widgetHeight,
        blacklistedWords,
        walletAddress,
        selectedToken,
        minDonationAmount,
        customDonationUrl,
        progressBarStart,
        burnedTokensIgnore,
        burnGoals,
        timerHours,
        timerMinutes,
        timerSeconds,
        timeAddedPerBuy,
        timeRemovedPerSell,
        minTransactionValue,
        telegramHandle,
        xHandle,
        showWatermark,
        enableQR, qrMode, qrCustomUrl, qrSize, qrPosition, qrColor, qrBg, qrRadius,
        typoFont, typoWeight, typoTracking,
        animStyle, animSpeed,
        // Monetization & Growth additions
        showDonationBadge, donationBadgeText, badgePosition, badgeColor,
        showGrowthTicker, growthMessage, tickerPosition, tickerSpeed,
      }
      
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName,
          widget: activeSection,
          config: payload
        })
      })
      
      const data = await res.json()
      if (data.ok) {
        // Track preset save
        trackPresetSave(activeSection, data.data?.id, {
          presetName,
          configSize: Object.keys(payload).length,
        })
        
        // Refresh preset list
        const listRes = await fetch('/api/presets')
        const listData = await listRes.json()
        if (listData.ok) {
          setPresetList(listData.data)
          setPresetName("")
        }
      }
    } catch {}
    setPresetLoading(false)
  }

  const loadPreset = async (presetId: string) => {
    if (!presetId || presetLoading) return
    setPresetLoading(true)
    try {
      const res = await fetch('/api/presets')
      const data = await res.json()
      if (data.ok) {
        const preset = data.data.find((p: any) => p.id === presetId)
        if (preset) {
          const p = preset.config
          setActiveSection(p.activeSection ?? activeSection)
          setColorStyle(p.colorStyle ?? colorStyle)
          setTokenCA(p.tokenCA ?? tokenCA)
          setBuyAmounts(p.buyAmounts ?? buyAmounts)
          setSelectedAudio(p.selectedAudio ?? selectedAudio)
          setAudioVolume(p.audioVolume ?? audioVolume)
          setMarketCapGoals(p.marketCapGoals ?? marketCapGoals)
          setTtsToken(p.ttsToken ?? ttsToken)
          setChatStyle(p.chatStyle ?? chatStyle)
          setRemoveAvatars(!!p.removeAvatars)
          setWidgetWidth(p.widgetWidth ?? widgetWidth)
          setWidgetHeight(p.widgetHeight ?? widgetHeight)
          setBlacklistedWords(p.blacklistedWords ?? blacklistedWords)
          setWalletAddress(p.walletAddress ?? walletAddress)
          setSelectedToken(p.selectedToken ?? selectedToken)
          setMinDonationAmount(p.minDonationAmount ?? minDonationAmount)
          setCustomDonationUrl(p.customDonationUrl ?? customDonationUrl)
          setProgressBarStart(p.progressBarStart ?? progressBarStart)
          setBurnedTokensIgnore(p.burnedTokensIgnore ?? burnedTokensIgnore)
          setBurnGoals(p.burnGoals ?? burnGoals)
          setTimerHours(p.timerHours ?? timerHours)
          setTimerMinutes(p.timerMinutes ?? timerMinutes)
          setTimerSeconds(p.timerSeconds ?? timerSeconds)
          setTimeAddedPerBuy(p.timeAddedPerBuy ?? timeAddedPerBuy)
          setTimeRemovedPerSell(p.timeRemovedPerSell ?? timeRemovedPerSell)
          setMinTransactionValue(p.minTransactionValue ?? minTransactionValue)
          setTelegramHandle(p.telegramHandle ?? telegramHandle)
          setXHandle(p.xHandle ?? xHandle)
          setShowWatermark(!!p.showWatermark)
          setEnableQR(!!p.enableQR)
          setQrMode(p.qrMode ?? qrMode)
          setQrCustomUrl(p.qrCustomUrl ?? qrCustomUrl)
          setQrSize(p.qrSize ?? qrSize)
          setQrPosition(p.qrPosition ?? qrPosition)
          setQrColor(p.qrColor ?? qrColor)
          setQrBg(p.qrBg ?? qrBg)
          setQrRadius(p.qrRadius ?? qrRadius)
          setTypoFont(p.typoFont ?? typoFont)
          setTypoWeight(p.typoWeight ?? typoWeight)
          setTypoTracking(p.typoTracking ?? typoTracking)
          setAnimStyle(p.animStyle ?? animStyle)
          setAnimSpeed(p.animSpeed ?? animSpeed)
          // Monetization & Growth additions
          setShowDonationBadge(!!p.showDonationBadge)
          setDonationBadgeText(p.donationBadgeText ?? donationBadgeText)
          setBadgePosition(p.badgePosition ?? badgePosition)
          setBadgeColor(p.badgeColor ?? badgeColor)
          setShowGrowthTicker(!!p.showGrowthTicker)
          setGrowthMessage(p.growthMessage ?? growthMessage)
          setTickerPosition(p.tickerPosition ?? tickerPosition)
          setTickerSpeed(p.tickerSpeed ?? tickerSpeed)
          
          // Track preset load
          trackPresetLoad(preset.widget, presetId, {
            presetName: preset.name,
            configSize: Object.keys(p).length,
          })
        }
      }
    } catch {}
    setPresetLoading(false)
  }

  const shareWidget = async () => {
    try {
      const widgetName = prompt("Enter a name for your shared widget:")
      if (!widgetName) return

      const description = prompt("Enter a description (optional):") || undefined
      const tags = prompt("Enter tags separated by commas (optional):")?.split(',').map(t => t.trim()).filter(Boolean) || undefined

      const config = {
        activeSection,
        colorStyle,
        tokenCA,
        buyAmounts,
        selectedAudio,
        audioVolume,
        marketCapGoals,
        ttsToken,
        chatStyle,
        removeAvatars,
        widgetWidth,
        widgetHeight,
        blacklistedWords,
        walletAddress,
        selectedToken,
        minDonationAmount,
        customDonationUrl,
        progressBarStart,
        burnedTokensIgnore,
        burnGoals,
        timerHours,
        timerMinutes,
        timerSeconds,
        timeAddedPerBuy,
        timeRemovedPerSell,
        minTransactionValue,
        enableQR,
        qrMode,
        qrCustomUrl,
        qrSize,
        qrPosition,
        qrColor,
        qrBg,
        qrRadius,
        typoFont,
        typoWeight,
        typoTracking,
        animStyle,
        animSpeed,
        showDonationBadge,
        donationBadgeText,
        badgePosition,
        badgeColor,
        showGrowthTicker,
        growthMessage,
        tickerPosition,
        tickerSpeed,
      }

      const res = await fetch('/api/shared-widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: widgetName,
          description,
          widgetType: activeSection,
          config,
          isPublic: true,
          tags,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        const shareUrl = `${window.location.origin}/shared/${data.data.shareToken}`
        navigator.clipboard.writeText(shareUrl)
        alert(`Widget shared! Link copied to clipboard: ${shareUrl}`)
      } else {
        alert('Failed to share widget: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to share widget:', error)
      alert('Failed to share widget')
    }
  }

  // Wallet connection functions
  const openWalletModal = () => {
    setShowWalletModal(true)
    setWalletError("")
  }

  const handleWalletSelect = async (walletType: string) => {
    setIsConnecting(true)
    setSelectedWalletType(walletType)
    setWalletError("")
    
    try {
      // Check for specific wallet availability
      let wallet = null
      
      if (walletType === 'phantom' && typeof window !== 'undefined' && (window as any).solana?.isPhantom) {
        wallet = (window as any).solana
      } else if (walletType === 'solflare' && typeof window !== 'undefined' && (window as any).solflare) {
        wallet = (window as any).solflare
      } else if (walletType === 'coinbase' && typeof window !== 'undefined' && (window as any).coinbaseWallet) {
        wallet = (window as any).coinbaseWallet
      }
      
      if (wallet) {
        // Real wallet connection
        const response = await wallet.connect()
        
        if (response.publicKey) {
          const publicKey = response.publicKey.toString()
          setWalletAddress(publicKey)
          setIsWalletConnected(true)
          
          // Mock token fetching - in real implementation, this would fetch from Solana RPC
          setAvailableTokens([
            "SOL - Solana",
            "USDC - USD Coin", 
            "USDT - Tether USD",
            "RAY - Raydium",
            "SRM - Serum"
          ])
          
          // Auto-select first token if none selected
          if (!selectedToken) {
            setSelectedToken("SOL - Solana")
          }
        }
      } else {
        // Fallback for demo purposes - simulate wallet connection
        setTimeout(() => {
          const mockAddress = "9hAv86Yo" + Math.random().toString(36).substring(2, 15)
          setWalletAddress(mockAddress)
          setIsWalletConnected(true)
          setAvailableTokens([
            "SOL - Solana",
            "USDC - USD Coin", 
            "USDT - Tether USD",
            "RAY - Raydium",
            "SRM - Serum"
          ])
          if (!selectedToken) {
            setSelectedToken("SOL - Solana")
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setWalletError(`Failed to connect ${walletType} wallet. Please try again.`)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress("")
    setSelectedToken("")
    setIsWalletConnected(false)
    setAvailableTokens([])
    setWalletError("")
  }

  const handleTemplateSelect = (template: WidgetTemplate) => {
    // Apply template configuration
    const config = template.config
    
    // Map template config to our state variables
    if (config.colorStyle) setColorStyle(config.colorStyle)
    if (config.animation) setAnimStyle(config.animation)
    if (config.fontSize) {
      // Map fontSize to typography settings
      const fontSizeMap = {
        'small': { weight: 400, tracking: -0.5 },
        'medium': { weight: 500, tracking: 0 },
        'large': { weight: 600, tracking: 0.5 }
      }
      const settings = fontSizeMap[config.fontSize as keyof typeof fontSizeMap]
      if (settings) {
        setTypoWeight(settings.weight)
        setTypoTracking(settings.tracking)
      }
    }
    
    // Set the active section based on template category
    const categoryMap = {
      'Market Data': 'market-cap',
      'Donations': 'donations',
      'Trading': 'buy-bot',
      'Community': 'chat-widget',
      'Goals': 'burn-goals',
      'Events': 'subathon-timer'
    }
    const widgetType = categoryMap[template.category as keyof typeof categoryMap]
    if (widgetType) {
      setActiveSection(widgetType)
    }
    
    // Close templates view
    setShowTemplates(false)
    
    // Show success message
    alert(`Template "${template.name}" applied successfully!`)
  }

  // const handleThemeSelect = (theme: WidgetTheme) => {
  //   setCurrentTheme(theme.id)
  //   // Apply theme colors and settings
  //   if (theme.colors.primary) setColorStyle(theme.id)
  //   if (theme.typography.fontFamily) setTypoFont(theme.typography.fontFamily)
  //   if (theme.typography.fontWeight) setTypoWeight(theme.typography.fontWeight)
  //   if (theme.typography.letterSpacing) setTypoTracking(theme.typography.letterSpacing)
  //   if (theme.animations.style) setAnimStyle(theme.animations.style)
  //   if (theme.animations.speed) setAnimSpeed(theme.animations.speed)
  // }

  // const handleAnimationSelect = (animation: WidgetAnimation) => {
  //   setCurrentAnimation(animation.id)
  //   setAnimStyle(animation.config.type as any)
  //   setAnimSpeed(animation.config.duration / 1000)
  // }

  const handleAdvancedSection = (section: string) => {
    // Close all other advanced sections
    setShowTemplates(false)
    setShowThemes(false)
    setShowExport(false)
    setShowAnimations(false)
    setShowScheduler(false)
    
    // Open the selected section
    switch (section) {
      case 'themes':
        setShowThemes(true)
        break
      case 'animations':
        setShowAnimations(true)
        break
      case 'export':
        setShowExport(true)
        break
      case 'scheduler':
        setShowScheduler(true)
        break
    }
  }

  // Build a sharable widget URL with the current configuration encoded as base64 JSON
  const buildWidgetUrl = (): string => {
    const cfg: Record<string, any> = {
      section: activeSection,
      tokenCA,
      colorStyle,
      buyAmounts,
      audio: { selectedAudio, audioVolume },
      marketCapGoals,
      chat: { ttsToken, chatStyle, removeAvatars, widgetWidth, widgetHeight, blacklistedWords },
      donations: { walletAddress, selectedToken, minDonationAmount, customDonationUrl },
      burn: { progressBarStart, burnedTokensIgnore, burnGoals },
      subathon: { timerHours, timerMinutes, timerSeconds, timeAddedPerBuy, timeRemovedPerSell, minTransactionValue },
      branding: { telegramHandle, xHandle, showWatermark },
      qr: { enableQR, qrMode, qrCustomUrl, qrSize, qrPosition, qrColor, qrBg, qrRadius },
      typography: { typoFont, typoWeight, typoTracking },
      animation: { animStyle, animSpeed },
      monetization: { showDonationBadge, donationBadgeText, badgePosition, badgeColor },
      growth: { showGrowthTicker, growthMessage, tickerPosition, tickerSpeed },
    }
    try {
      const json = JSON.stringify(cfg)
      const b64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : ""
      const base = typeof window !== "undefined" ? window.location.origin : ""
      return `${base}/widget/${activeSection}?cfg=${b64}`
    } catch {
      return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black text-white flex">
      <div
        className={`${isCollapsed ? "w-16" : "w-64"} bg-gradient-to-b from-purple-900/30 to-black border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        {/* Collapse Button */}
        <div className="p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {!isCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>

        {/* Back to Home */}
        <div className="p-4 border-b border-gray-800">
          <Link
                href="/"
            className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">Back to Home</span>}
          </Link>
        </div>

        {/* Auth Button */}
        <div className="p-4 border-b border-gray-800">
          <div className={isCollapsed ? "flex justify-center" : ""}>
            <AuthButton isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Analytics Link */}
        <div className="p-4 border-b border-gray-800">
          <NavItem 
            href="/analytics" 
            icon={BarChart3} 
            label="Analytics" 
            isCollapsed={isCollapsed} 
          />
        </div>

        {/* Webhooks Link */}
        <div className="p-4 border-b border-gray-800">
          <NavItem 
            href="/webhooks" 
            icon={Webhook} 
            label="Webhooks" 
            isCollapsed={isCollapsed} 
          />
        </div>

        {/* Community Link */}
        <div className="p-4 border-b border-gray-800">
          <NavItem 
            href="/community" 
            icon={Share2} 
            label="Community" 
            isCollapsed={isCollapsed} 
          />
        </div>

        {/* Templates Link */}
        <div className="p-4 border-b border-gray-800">
          <NavItem 
            icon={FileText} 
            label="Templates" 
            isCollapsed={isCollapsed}
            onClick={() => setShowTemplates(true)}
          />
        </div>

        {/* Configure Section */}
        <div className="flex-1 p-4">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">CONFIGURE</div>
          )}

          <div className="space-y-2">
            {configureItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <ConfigureItem
                  key={item.id}
                  icon={Icon}
                  label={item.label}
                  subtitle={item.subtitle}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onClick={() => activate(item.id)}
                />
              )
            })}
            {/* Growth & Branding quick access */}
            <ConfigureItem
              icon={Send}
              label="Branding & Sharing"
              subtitle="Community links, QR, typography"
              isActive={false}
              isCollapsed={isCollapsed}
              onClick={() => brandingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
            {/* Monetization */}
            <ConfigureItem
              icon={Heart}
              label="Monetization"
              subtitle="Donation badge, calls to action"
              isActive={false}
              isCollapsed={isCollapsed}
              onClick={() => monetizationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
            {/* Community Growth */}
            <ConfigureItem
              icon={MessageSquare}
              label="Community Growth"
              subtitle="Ticker, messages, social CTA"
              isActive={false}
              isCollapsed={isCollapsed}
              onClick={() => growthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
          </div>
        </div>

        {/* Resources Section */}
        <div className="p-4 border-t border-gray-800">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">RESOURCES</div>
          )}

          <div className="space-y-2">
            {resourceItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Advanced Features Section */}
        <div className="p-4 border-t border-gray-800">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">ADVANCED</div>
          )}

          <div className="space-y-2">
            {advancedItems.map((item) => {
              const Icon = item.icon
              const isActive = (item.id === 'themes' && showThemes) ||
                              (item.id === 'animations' && showAnimations) ||
                              (item.id === 'export' && showExport) ||
                              (item.id === 'scheduler' && showScheduler)

              return (
                <button
                  key={item.id}
                  onClick={() => handleAdvancedSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive 
                      ? "text-orange-500 bg-orange-500/10 border border-orange-500/20" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex" style={{justifyContent: "center"}}>
        {/* Main Configuration Form */}
        <div className="flex-1 p-8 max-w-4xl">
          {showTemplates ? (
            <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(false)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Configuration
                </Button>
              </div>
              <WidgetTemplates 
                onSelectTemplate={handleTemplateSelect}
                currentWidget={activeSection}
              />
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-8">
              {activeSection === "buy-bot" && "Buy Bot Widget Configuration"}
              {activeSection === "market-cap" && "Market Cap Widget Configuration"}
              {activeSection === "chat-widget" && "Chat Widget Configuration"}
              {activeSection === "donations" && "Donations Widget Configuration"}
              {activeSection === "portfolio-tracker" && "Portfolio Tracker Configuration"}
              {activeSection === "price-alerts" && "Price Alerts Configuration"}
              {activeSection === "widget-share" && "Widget Share Configuration"}
              {activeSection === "burn-goals" && "Burn Goals Widget Configuration"}
              {activeSection === "subathon" && "Subathon Widget Configuration"}
            </h1>

            {/* Step 1: Enter Token CA */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">1. Enter token's CA</Label>
              <Input
                placeholder="e.g. 9hAv86Yo..."
                value={tokenCA}
                onChange={(e) => setTokenCA(e.target.value)}
                className="bg-black/50 border-gray-700 text-white"
              />
              {!tokenCA && (
                <p className="text-red-400 text-sm mt-1">Token address is required.</p>
              )}
            </div>

            {/* Conditional content based on active section */}
            {activeSection === "buy-bot" && (
              <>
            {/* Step 2: Buy Sizes */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">2. Select the buy size for each tier</Label>
              <div className="grid grid-cols-3 gap-4">
                {buyAmounts.map((amount, index) => (
                  <Input
                    key={index}
                    placeholder={`$${amount}`}
                    value={amount}
                    onChange={(e) => {
                      const newAmounts = [...buyAmounts]
                      newAmounts[index] = e.target.value
                      setBuyAmounts(newAmounts)
                    }}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                ))}
              </div>
            </div>
              </>
            )}

            {activeSection === "market-cap" && (
              <>
                {/* Step 2: Market Cap Goals */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">2. Set Market Cap Goals (USD)</Label>
                  <p className="text-gray-400 text-sm mb-4">
                    Set up to three market capitalization goals and optional custom text for each. Higher tier goals must be greater than lower ones.
                  </p>
                  <div className="space-y-4">
                    {marketCapGoals.map((goal, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-300 mb-2 block">Market cap goal {index + 1}</Label>
                          <Input
                            placeholder="e.g. 1000000"
                            value={goal.goal}
                            onChange={(e) => {
                              const newGoals = [...marketCapGoals]
                              newGoals[index].goal = e.target.value
                              setMarketCapGoals(newGoals)
                            }}
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-300 mb-2 block">Custom text {index + 1}</Label>
                          <Input
                            placeholder="e.g. First milestone"
                            value={goal.text}
                            onChange={(e) => {
                              const newGoals = [...marketCapGoals]
                              newGoals[index].text = e.target.value
                              setMarketCapGoals(newGoals)
                            }}
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSection === "chat-widget" && (
              <>
                {/* Step 2: TTS Configuration */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">2. TTS Configuration</Label>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                    <h3 className="text-orange-400 font-semibold mb-2">TTS is in Beta</h3>
                    <p className="text-gray-300 text-sm">
                      Text-to-Speech is a beta feature. Please enter the access token to enable TTS configuration.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter your Beta Access Token"
                      value={ttsToken}
                      onChange={(e) => setTtsToken(e.target.value)}
                      className="bg-black/50 border-gray-700 text-white flex-1"
                    />
                    <Button className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white px-6">
                      Enter
                    </Button>
                  </div>
                </div>

                {/* Step 3: Select Style */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">3. Select Style</Label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { id: "pump-fun", label: "Pump Fun" },
                      { id: "classic", label: "Classic" }
                    ].map((style) => (
                      <Button
                        key={style.id}
                        variant={chatStyle === style.id ? "default" : "outline"}
                        onClick={() => setChatStyle(style.id)}
                        className={`relative ${
                          chatStyle === style.id
                            ? "bg-gradient-to-r from-orange-400 to-amber-500 border-orange-400"
                            : "bg-black/50 border-gray-700 hover:bg-gray-800"
                        }`}
                      >
                        {style.label}
                        {chatStyle === style.id && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remove-avatars" 
                      checked={removeAvatars}
                      onCheckedChange={(checked) => setRemoveAvatars(checked as boolean)}
                    />
                    <Label htmlFor="remove-avatars">Remove Avatars</Label>
                  </div>
                </div>

                {/* Step 4: Widget Dimensions */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">4. Widget Dimensions (optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Width (px)</Label>
                      <Input
                        placeholder="600"
                        value={widgetWidth}
                        onChange={(e) => setWidgetWidth(e.target.value)}
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Height (px)</Label>
                      <Input
                        placeholder="600"
                        value={widgetHeight}
                        onChange={(e) => setWidgetHeight(e.target.value)}
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Min: 200x100. Defaults to 600x600 if empty.
                  </p>
                </div>

                {/* Step 5: Blacklisted Words */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">5. Blacklisted Words</Label>
                  <Input
                    placeholder="e.g. scam, rug, fud"
                    value={blacklistedWords}
                    onChange={(e) => setBlacklistedWords(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Words entered here will be filtered from the chat widget. Filtering is case-insensitive.
                  </p>
                </div>
              </>
            )}

            {activeSection === "donations" && (
              <>
                {/* Configure Your Details */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6">Configure Your Details</h2>
                  
                  {/* Select Wallet Button */}
                  <div className="mb-6">
                    {!isWalletConnected ? (
                      <Button 
                        onClick={openWalletModal}
                        disabled={isConnecting}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-semibold"
                      >
                        {isConnecting ? "Connecting..." : "Select Wallet"}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={disconnectWallet}
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10 px-4 py-2"
                        >
                          Disconnect
                        </Button>
                        <div className="text-green-400 text-sm">
                          ✓ {selectedWalletType ? selectedWalletType.charAt(0).toUpperCase() + selectedWalletType.slice(1) : 'Wallet'} Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                        </div>
                      </div>
                    )}
                    {walletError && (
                      <p className="text-red-400 text-sm mt-2">{walletError}</p>
                    )}
                  </div>

                  {/* Important Information Box */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">i</span>
                      </div>
                      <div>
                        <p className="text-blue-300 text-sm leading-relaxed">
                          You need to connect a wallet to verify that you created the token. We connect securely through Phantom's verified wallet adapter and never ask for your private keys.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Your Wallet Address */}
                  <div className="mb-6">
                    <Label className="text-lg font-medium mb-3 block">Your Wallet Address</Label>
                    <Input
                      placeholder={isWalletConnected ? "Wallet connected" : "Connect your wallet to set the wallet address"}
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={isWalletConnected}
                      className="bg-black/50 border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Select Your Token */}
                  <div className="mb-6">
                    <Label className="text-lg font-medium mb-3 block">Select Your Token</Label>
                    <div className="relative">
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        disabled={!isWalletConnected}
                        className="w-full bg-black/50 border border-gray-700 text-white pr-10 py-2 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">
                          {isWalletConnected ? "Select a token" : "Connect wallet to see your tokens"}
                        </option>
                        {availableTokens.map((token) => (
                          <option key={token} value={token} className="bg-black text-white">
                            {token}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Donation Amount */}
                  <div className="mb-6">
                    <Label className="text-lg font-medium mb-3 block">Minimum Donation Amount (SOL)</Label>
                    <Input
                      placeholder="0.01"
                      value={minDonationAmount}
                      onChange={(e) => setMinDonationAmount(e.target.value)}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>

                  {/* Custom Donation URL Name */}
                  <div className="mb-6">
                    <Label className="text-lg font-medium mb-3 block">Custom Donation URL Name</Label>
                    <Input
                      placeholder={isWalletConnected ? "Enter custom donation URL name" : "Connect your wallet to set the donation token name"}
                      value={customDonationUrl}
                      onChange={(e) => setCustomDonationUrl(e.target.value)}
                      disabled={!isWalletConnected}
                      className="bg-black/50 border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Save Settings Button */}
                  <div className="mb-8">
                    <Button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeSection === "burn-goals" && (
              <>
                {/* Step 2: Progress Bar Start Value */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">2. Progress Bar Start Value (Optional)</Label>
                  <Input
                    placeholder="e.g., 500000"
                    value={progressBarStart}
                    onChange={(e) => setProgressBarStart(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                </div>

                {/* Step 3: Amount of Previously Burned Tokens to Ignore */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">3. Amount of Previously Burned Tokens to Ignore (Optional)</Label>
                  <Input
                    placeholder="e.g., 1000000"
                    value={burnedTokensIgnore}
                    onChange={(e) => setBurnedTokensIgnore(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                </div>

                {/* Step 4: Set Token Burn Goals */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">4. Set Token Burn Goals</Label>
                  <p className="text-gray-400 text-sm mb-4">
                    Set up to five token burn goals and optional custom text for each. Higher tier goals must be greater than lower ones.
                  </p>
                  <div className="space-y-4">
                    {burnGoals.map((goal, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-300 mb-2 block">Burn goal {index + 1}</Label>
                          <Input
                            placeholder="e.g. 1000000"
                            value={goal.goal}
                            onChange={(e) => {
                              const newGoals = [...burnGoals]
                              newGoals[index].goal = e.target.value
                              setBurnGoals(newGoals)
                            }}
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-300 mb-2 block">Custom text {index + 1}</Label>
                          <Input
                            placeholder="e.g. First milestone"
                            value={goal.text}
                            onChange={(e) => {
                              const newGoals = [...burnGoals]
                              newGoals[index].text = e.target.value
                              setBurnGoals(newGoals)
                            }}
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSection === "subathon" && (
              <>
                {/* Step 2: Set Initial Timer Duration */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">2. Set Initial Timer Duration</Label>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Hours</Label>
                      <Input
                        placeholder="e.g., 12"
                        value={timerHours}
                        onChange={(e) => setTimerHours(e.target.value)}
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Minutes</Label>
                      <Input
                        placeholder="e.g., 30"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(e.target.value)}
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Seconds</Label>
                      <Input
                        placeholder="e.g., 0"
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(e.target.value)}
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  {!timerHours && !timerMinutes && !timerSeconds && (
                    <p className="text-red-400 text-sm mt-1">Initial duration must be greater than 0 seconds.</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">
                    Set the starting time for the subathon timer. At least one field must be greater than 0.
                  </p>
                </div>

                {/* Step 3: Set Time Added per Buy */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">3. Set Time Added per Buy</Label>
                  <p className="text-gray-300 text-sm mb-2">Seconds added per 1 SOL buy.</p>
                  <Input
                    placeholder="e.g., 60"
                    value={timeAddedPerBuy}
                    onChange={(e) => setTimeAddedPerBuy(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                  {timeAddedPerBuy && parseFloat(timeAddedPerBuy) < 0 && (
                    <p className="text-red-400 text-sm mt-1">Seconds per SOL buy must be a non-negative number.</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">
                    Specify how many seconds to add to the timer for each 1 SOL worth of tokens purchased.
                  </p>
                </div>

                {/* Step 4: Set Time Removed per Sell */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">4. Set Time Removed per Sell</Label>
                  <p className="text-gray-300 text-sm mb-2">Seconds removed per 1 SOL sell.</p>
                  <Input
                    placeholder="0"
                    value={timeRemovedPerSell}
                    onChange={(e) => setTimeRemovedPerSell(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Specify how many seconds to remove from the timer for each 1 SOL worth of tokens sold. Leave blank or set to 0 if sells should not affect the timer.
                  </p>
                </div>

                {/* Step 5: Set Minimum Transaction Value */}
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">5. Set Minimum Transaction Value</Label>
                  <p className="text-gray-300 text-sm mb-2">Minimum SOL transaction to affect timer.</p>
                  <Input
                    placeholder="0"
                    value={minTransactionValue}
                    onChange={(e) => setMinTransactionValue(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Only buys and sells greater than or equal to this SOL value will affect the timer. Leave blank or set to 0 to include all transactions.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Color & Style (hidden on Chat Widget only) */}
            {activeSection !== "chat-widget" && (
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">3. Choose Color & Style</Label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {["Light", "Dark", "Bright"].map((style) => (
                  <Button
                    key={style}
                    variant={colorStyle === style.toLowerCase() ? "default" : "outline"}
                    onClick={() => setColorStyle(style.toLowerCase())}
                    className={`relative ${
                      colorStyle === style.toLowerCase()
                          ? "bg-gradient-to-r from-orange-400 to-amber-500 border-orange-400"
                        : "bg-black/50 border-gray-700 hover:bg-gray-800"
                    }`}
                  >
                    {style}
                    {colorStyle === style.toLowerCase() && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="opacity" />
                <Label htmlFor="opacity">Add background opacity</Label>
              </div>
            </div>
            )}

            {/* Community & Branding (Optional) */}
            <div ref={brandingRef} className="mb-6">
              <Label className="text-lg font-medium mb-3 block">Community & Branding (Optional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-300 mb-2 block">Telegram Handle</Label>
                  <Input
                    placeholder="e.g., streamdotfun"
                    value={telegramHandle}
                    onChange={(e) => setTelegramHandle(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-300 mb-2 block">X (Twitter) Handle</Label>
                  <Input
                    placeholder="e.g., streamdotfun"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Checkbox id="wm" checked={showWatermark} onCheckedChange={(c) => setShowWatermark(!!c)} />
                <Label htmlFor="wm" className="text-sm">Show small "Streamertools.fun" watermark in widgets</Label>
              </div>
              <p className="text-gray-500 text-xs mt-2">Helps viewers discover your community and fits the project's creator-first ideology.</p>
            </div>

            {/* QR Code Overlay */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">QR Code Overlay</Label>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox id="qr-enable" checked={enableQR} onCheckedChange={(c) => setEnableQR(!!c)} />
                <Label htmlFor="qr-enable">Enable QR overlay</Label>
              </div>
              {enableQR && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Source</Label>
                      <div className="flex gap-2">
                        <Button size="sm" variant={qrMode === "donations" ? "default" : "outline"} onClick={() => setQrMode("donations")} className={qrMode === "donations" ? "bg-gradient-to-r from-orange-400 to-amber-500" : "bg-black/50 border-gray-700"}>Donations</Button>
                        <Button size="sm" variant={qrMode === "custom" ? "default" : "outline"} onClick={() => setQrMode("custom")} className={qrMode === "custom" ? "bg-gradient-to-r from-orange-400 to-amber-500" : "bg-black/50 border-gray-700"}>Custom URL</Button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm text-gray-300 mb-2 block">Custom URL</Label>
                      <Input placeholder="https://..." value={qrCustomUrl} onChange={(e) => setQrCustomUrl(e.target.value)} className="bg-black/50 border-gray-700 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Size: {qrSize}px</Label>
                      <input type="range" min={64} max={180} value={qrSize} onChange={(e)=>setQrSize(parseInt(e.target.value))} className="w-full accent-orange-400" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Position</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["tl","tr","bl","br"] as const).map(p => (
                          <Button key={p} size="sm" variant={qrPosition===p?"default":"outline"} onClick={()=>setQrPosition(p)} className={qrPosition===p?"bg-gradient-to-r from-orange-400 to-amber-500":"bg-black/50 border-gray-700"}>{p.toUpperCase()}</Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm text-gray-300 mb-2 block">Foreground</Label>
                        <input type="color" value={qrColor} onChange={(e)=>setQrColor(e.target.value)} className="w-full h-10 bg-black/50 border border-gray-700 rounded" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-300 mb-2 block">Background</Label>
                        <input type="color" value={qrBg} onChange={(e)=>setQrBg(e.target.value)} className="w-full h-10 bg-black/50 border border-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Corner Radius: {qrRadius}px</Label>
                    <input type="range" min={0} max={24} value={qrRadius} onChange={(e)=>setQrRadius(parseInt(e.target.value))} className="w-full accent-orange-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Typography */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">Typography</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-sm text-gray-300 mb-2 block">Font Family</Label>
                  <Input value={typoFont} onChange={(e)=>setTypoFont(e.target.value)} className="bg-black/50 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-sm text-gray-300 mb-2 block">Weight: {typoWeight}</Label>
                  <input type="range" min={300} max={900} step={50} value={typoWeight} onChange={(e)=>setTypoWeight(parseInt(e.target.value))} className="w-full accent-orange-400" />
                </div>
              </div>
              <div className="mt-3">
                <Label className="text-sm text-gray-300 mb-2 block">Letter Spacing: {typoTracking}px</Label>
                <input type="range" min={-1} max={4} step={0.5} value={typoTracking} onChange={(e)=>setTypoTracking(parseFloat(e.target.value))} className="w-full accent-orange-400" />
              </div>
            </div>

            {/* Animation Tuning */}
            <div className="mb-8">
              <Label className="text-lg font-medium mb-3 block">Animation</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm text-gray-300 mb-2 block">Entrance Style</Label>
                  <div className="flex gap-2">
                    {(["fade","slide","zoom"] as const).map(s => (
                      <Button key={s} size="sm" variant={animStyle===s?"default":"outline"} onClick={()=>setAnimStyle(s)} className={animStyle===s?"bg-gradient-to-r from-orange-400 to-amber-500":"bg-black/50 border-gray-700"}>{s}</Button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm text-gray-300 mb-2 block">Speed: {animSpeed}s</Label>
                  <input type="range" min={0.2} max={1.5} step={0.1} value={animSpeed} onChange={(e)=>setAnimSpeed(parseFloat(e.target.value))} className="w-full accent-orange-400" />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="mb-8">
              <Label className="text-lg font-medium mb-3 block">Presets</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Preset name" value={presetName} onChange={(e)=>setPresetName(e.target.value)} className="bg-black/50 border-gray-700 text-white sm:w-64" />
                <Button onClick={savePreset} disabled={presetLoading} className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white">
                  {presetLoading ? "Saving..." : "Save Preset"}
                </Button>
                {presetList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Load:</Label>
                    <select onChange={(e)=>loadPreset(e.target.value)} disabled={presetLoading} className="bg-black/50 border border-gray-700 rounded px-2 py-2 text-sm">
                      <option value="">Select preset</option>
                      {presetList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.widget})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {presetList.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {presetList.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-black/30 border border-gray-700 rounded px-3 py-2">
                      <div>
                        <div className="text-white text-sm font-medium">{p.name}</div>
                        <div className="text-gray-400 text-xs">{p.widget}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => loadPreset(p.id)} disabled={presetLoading} className="text-xs px-2 py-1">
                          Load
                        </Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          if (confirm('Delete this preset?')) {
                            try {
                              await fetch(`/api/presets?id=${p.id}`, { method: 'DELETE' })
                              const res = await fetch('/api/presets')
                              const data = await res.json()
                              if (data.ok) setPresetList(data.data)
                            } catch {}
                          }
                        }} disabled={presetLoading} className="text-xs px-2 py-1 text-red-400 hover:text-red-300">
                          Del
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Share Widget */}
            <div className="mb-8">
              <Label className="text-lg font-medium mb-3 block">Share Widget</Label>
              <Button
                onClick={shareWidget}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share to Community
              </Button>
            </div>

            {/* Monetization Section */}
            <div ref={monetizationRef} className="mb-8">
              <Label className="text-lg font-medium mb-3 block">Monetization</Label>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox id="don-badge" checked={showDonationBadge} onCheckedChange={(c)=>setShowDonationBadge(!!c)} />
                <Label htmlFor="don-badge">Show Donation CTA badge in widget</Label>
              </div>
              {showDonationBadge && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-sm text-gray-300 mb-2 block">Badge text</Label>
                    <Input value={donationBadgeText} onChange={(e)=>setDonationBadgeText(e.target.value)} className="bg-black/50 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Position</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["tl","tr","bl","br"] as const).map(p => (
                        <Button key={p} size="sm" variant={badgePosition===p?"default":"outline"} onClick={()=>setBadgePosition(p)} className={badgePosition===p?"bg-gradient-to-r from-orange-400 to-amber-500":"bg-black/50 border-gray-700"}>{p.toUpperCase()}</Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Color</Label>
                    <input type="color" value={badgeColor} onChange={(e)=>setBadgeColor(e.target.value)} className="w-full h-10 bg-black/50 border border-gray-700 rounded" />
                  </div>
                </div>
              )}
            </div>

            {/* Community Growth Section */}
            <div ref={growthRef} className="mb-8">
              <Label className="text-lg font-medium mb-3 block">Community Growth</Label>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox id="growth-ticker" checked={showGrowthTicker} onCheckedChange={(c)=>setShowGrowthTicker(!!c)} />
                <Label htmlFor="growth-ticker">Show top ticker message</Label>
              </div>
              {showGrowthTicker && (
                <div>
                  <Label className="text-sm text-gray-300 mb-2 block">Ticker message</Label>
                  <Input value={growthMessage} onChange={(e)=>setGrowthMessage(e.target.value)} className="bg-black/50 border-gray-700 text-white" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <div>
                      <Label className="text-sm text-gray-300 mb-2 block">Position</Label>
                      <div className="flex gap-2">
                        {(["top","bottom"] as const).map(p => (
                          <Button key={p} size="sm" variant={tickerPosition===p?"default":"outline"} onClick={()=>setTickerPosition(p)} className={tickerPosition===p?"bg-gradient-to-r from-orange-400 to-amber-500":"bg-black/50 border-gray-700"}>{p}</Button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm text-gray-300 mb-2 block">Speed: {tickerSpeed}s</Label>
                      <input type="range" min={6} max={24} step={1} value={tickerSpeed} onChange={(e)=>setTickerSpeed(parseInt(e.target.value))} className="w-full accent-orange-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {activeSection === "buy-bot" && (
              <>
            {/* Step 4: Animation Tiers */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">4. Choose your animation</Label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {["Tier 1 GIF:", "Tier 2 GIF:", "Tier 3 GIF:"].map((tier, index) => (
                  <div
                    key={index}
                    className="bg-black/50 border border-gray-700 rounded-lg p-4 h-32 flex flex-col items-center justify-center"
                  >
                    <div className="font-medium text-gray-300 mb-2">{tier}</div>
                    <div className="text-sm text-gray-400 text-center">Click a GIF below to assign</div>
                  </div>
                ))}
              </div>

              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm mb-1">
                  Click a GIF below to assign it to the next available tier (Tier 1 → Tier 2 → Tier 3).
                </p>
                <p className="text-gray-400 text-sm">Use the "×" button on a selection above to remove it.</p>
              </div>

              {/* Category Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["All", "Animals", "Dance", "Memes", "Money", "NSFW", "Pepe", "Trump", "Collabs"].map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="bg-black/50 border-gray-700 hover:bg-gray-800"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 16 }).map((_, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      pendingIndexRef.current = index
                      fileInputRef.current?.click()
                    }}
                    className="bg-black/50 border border-gray-700 rounded-lg p-3 h-16 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
                    title="Click to upload a GIF"
                  >
                    {gifPreviews[index] ? (
                      <img src={gifPreviews[index] as string} alt={`GIF ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                    ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded"></div>
                    )}
                  </div>
                ))}
                {/* Hidden file input used for all cells */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/gif,image/webp,image/apng,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    const idx = pendingIndexRef.current
                    if (idx === null) return
                    setGifPreviews((prev) => {
                      const copy = [...prev]
                      copy[idx] = url
                      return copy
                    })
                    // reset input to allow re-selecting the same file later
                    e.currentTarget.value = ""
                  }}
                />
              </div>
            </div>

            {/* Step 5: Audio */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">5. Choose audio</Label>
              <div className="grid grid-cols-4 gap-4">
                    {["Off", "Clean", "Brainrot", "Anime girl"].map((audio) => {
                      const isActive = selectedAudio === audio
                      return (
                        <Button
                          key={audio}
                          variant={isActive ? "default" : "outline"}
                          onClick={() => setSelectedAudio(audio)}
                          className={`relative rounded-lg px-6 py-5 font-semibold transition-colors ${
                            isActive
                              ? "bg-black/70 border-orange-400 text-white ring-1 ring-orange-400/30"
                              : "bg-black/50 border-gray-700 text-white hover:bg-gray-800"
                          }`}
                        >
                    {audio}
                          {isActive && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-400 text-black text-[10px] font-bold">✓</span>
                          )}
                  </Button>
                        )
                      })}
                    </div>

                  {selectedAudio === "Clean" && (
                    <div className="mt-6 rounded-lg border border-gray-700 bg-black/40 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-300">Volume: {audioVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                        className="w-full accent-orange-400"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                        {[1,2,3].map((tier) => (
                          <button
                            key={tier}
                            className="flex items-center justify-center gap-3 rounded-md border border-gray-700 bg-black/50 px-4 py-4 hover:bg-gray-800 transition-colors"
                          >
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white">
                              <Play className="w-4 h-4" />
                            </span>
                            <span className="text-white font-medium">Tier {tier}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          )}
        </div>

        <div className="w-[500px] p-8">
          <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Preview</h2>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((tier) => (
                <Button
                  key={tier}
                  variant={activeTier === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTier(tier)}
                  className={`transition-all duration-200 ${
                    activeTier === tier
                      ? "bg-orange-400 border-orange-400 text-white hover:bg-orange-500"
                      : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  }`}
                >
                  Tier {tier}
                </Button>
              ))}
            </div>

            <div className={`relative border-2 rounded-lg p-6 mb-6 h-[600px] flex flex-col items-center justify-center ${
              activeSection === "market-cap" 
                ? "bg-black border-pink-500" 
                : activeSection === "donations"
                ? "bg-black border-pink-500"
                : activeSection === "burn-goals"
                ? "bg-black border-pink-500"
                : activeSection === "subathon"
                ? "bg-black border-pink-500"
                : "bg-white border-orange-400"
            }`}>
              {/* Community Growth ticker (top) */}
              {showGrowthTicker && (
                <div className={`absolute ${tickerPosition === "top" ? "top-2" : "bottom-2"} left-2 right-2`}>
                  <div className="mx-auto max-w-[85%] rounded-full border border-orange-500/40 bg-black/50 px-3 py-1 text-[11px] text-white shadow-[0_0_12px_rgba(249,115,22,0.25)]">
                    <div className="whitespace-nowrap overflow-hidden">
                      <span className="inline-block" style={{ animation: `marquee ${tickerSpeed}s linear infinite` }}>{growthMessage} • {growthMessage} • {growthMessage}</span>
                    </div>
                  </div>
                </div>
              )}
              {activeSection === "buy-bot" && (
                <>
              <div className="bg-gray-800 rounded px-3 py-1 mb-4">
                <div className="text-xs text-gray-400 text-center">THIS CONTENT</div>
                <div className="text-xs text-gray-400 text-center">IS NOT AVAILABLE</div>
                <div className="flex justify-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-white font-medium">Yje2ax</div>
                <div className="text-white font-medium">bought 1.00 sol (T70$)</div>
              </div>
                </>
              )}
              {activeSection === "market-cap" && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white font-bold text-2xl" style={{ fontFamily: typoFont, fontWeight: typoWeight as any, letterSpacing: `${typoTracking}px`, animation: `${animStyle}-in ${animSpeed}s ease` }}>Market Cap: $250k</div>
                </div>
              )}
              {activeSection === "chat-widget" && (
                <div className="w-full h-full bg-gray-100 rounded-lg p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {/* DiamondHands */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="bg-gray-300 rounded-lg p-2 flex-1">
                        <div className="text-xs font-medium text-gray-800 mb-1">DiamondHands</div>
                        <div className="text-xs text-gray-800">Paper hands get rekt.</div>
              </div>
            </div>

                    {/* CryptoChad */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">C</span>
                      </div>
                      <div className="bg-gray-300 rounded-lg p-2 flex-1">
                        <div className="text-xs font-medium text-gray-800 mb-1">CryptoChad</div>
                        <div className="text-xs text-gray-800">
                          This project is absolutely going to the moon! I have never been more certain of anything in my entire life. To the moon and beyond, folks!
                        </div>
                      </div>
                    </div>

                    {/* 4q2Xp1 */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-gray-300 rounded-lg p-2 flex-1">
                        <div className="text-xs font-medium text-gray-800 mb-1">4q2Xp1</div>
                        <div className="text-xs text-gray-800">LFG!</div>
                      </div>
                    </div>

                    {/* DiamondHands */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="bg-gray-300 rounded-lg p-2 flex-1">
                        <div className="text-xs font-medium text-gray-800 mb-1">DiamondHands</div>
                        <div className="text-xs text-gray-800">
                          Never selling. I have diamond hands and I will hold this token until it reaches at least a 1 billion market cap. We are so, so back.
                        </div>
                      </div>
                    </div>

                    {/* PepeLover with reply */}
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-lg p-1 mb-1">
                          <div className="text-xs text-gray-600 italic">
                            DiamondHands: Never selling. I have diamond hands...
                          </div>
                        </div>
                        <div className="bg-gray-300 rounded-lg p-2">
                          <div className="text-xs font-medium text-gray-800 mb-1">PepeLover</div>
                          <div className="text-xs text-gray-800">
                            <span className="text-cyan-500">@DiamondHands</span> I agree! The community is strong and the chart looks incredibly bullish. This is a long-term hold for me.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeSection === "donations" && (
                <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                  {/* Empty black box for donations preview */}
                </div>
              )}
              {activeSection === "portfolio-tracker" && (
                <div className="w-full h-full bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <PortfolioTracker 
                    config={{
                      showProfitLoss: true,
                      showPercentages: true,
                      theme: 'dark'
                    }}
                    onConfigChange={(config) => {
                      console.log('Portfolio tracker config changed:', config)
                    }}
                  />
                </div>
              )}
              {activeSection === "price-alerts" && (
                <div className="w-full h-full bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <PriceAlerts 
                    config={{
                      maxAlerts: 10,
                      theme: 'dark',
                      soundEnabled: true
                    }}
                    onConfigChange={(config) => {
                      console.log('Price alerts config changed:', config)
                    }}
                  />
                </div>
              )}
              {activeSection === "widget-share" && (
                <div className="w-full h-full bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <WidgetShare 
                    widgetId="current-widget"
                    widgetType={activeSection}
                    config={{
                      // Current widget configuration
                    }}
                    onShare={(shareData) => {
                      console.log('Widget shared:', shareData)
                    }}
                  />
                </div>
              )}
              {activeSection === "burn-goals" && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white font-bold text-2xl">Tokens Burnt: 500.0K</div>
                </div>
              )}
              {activeSection === "subathon" && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="text-white text-lg mb-4" style={{ fontFamily: typoFont, fontWeight: typoWeight as any, letterSpacing: `${typoTracking}px`, animation: `${animStyle}-in ${animSpeed}s ease` }}>TIME LEFT</div>
                  <div className="text-green-400 font-mono text-4xl font-bold tracking-wider" style={{ animation: `${animStyle}-in ${animSpeed}s ease` }}>00:00:00</div>
                </div>
              )}
              {/* Watermark + social handles in preview (bottom-left) */}
              {showWatermark && (
                <div className="absolute left-3 bottom-3 bg-black/50 border border-gray-700 text-white text-[10px] rounded px-2 py-1 flex items-center gap-2">
                  <span className="opacity-80">streamertools.fun</span>
                  {(telegramHandle || xHandle) && <span className="opacity-40">•</span>}
                  {telegramHandle && <span className="opacity-80">t.me/{telegramHandle}</span>}
                  {xHandle && <span className="opacity-80">x.com/{xHandle}</span>}
                </div>
              )}

              {/* Donation CTA badge (bottom-right) */}
              {showDonationBadge && (
                <div className="absolute" style={{
                  ...(badgePosition === "tl" && { top: 12, left: 12 }),
                  ...(badgePosition === "tr" && { top: 12, right: 12 }),
                  ...(badgePosition === "bl" && { bottom: 12, left: 12 }),
                  ...(badgePosition === "br" && { bottom: 12, right: 12 }),
                }}>
                  <div className="rounded-lg text-white text-xs font-semibold px-3 py-2 shadow-lg" style={{ background: badgeColor }}>
                    {donationBadgeText}
                  </div>
                </div>
              )}

              {/* QR overlay preview */}
              {enableQR && (() => {
                const hex = (s: string) => (s || "").replace(/^#/, "") || "000000"
                const size = Math.max(64, Math.min(512, qrSize))
                const data = qrMode === "donations"
                  ? (customDonationUrl || walletAddress || "https://streamertools.fun/donate")
                  : (qrCustomUrl || "https://streamertools.fun")
                return (
                  <div
                    className="absolute"
                    style={{
                      ...(qrPosition === "tl" && { top: 12, left: 12 }),
                      ...(qrPosition === "tr" && { top: 12, right: 12 }),
                      ...(qrPosition === "bl" && { bottom: 12, left: 12 }),
                      ...(qrPosition === "br" && { bottom: 12, right: 12 }),
                      width: size,
                      height: size,
                      borderRadius: qrRadius,
                      background: qrBg,
                      overflow: "hidden",
                      display: "grid",
                      placeItems: "center",
                      padding: 4,
                    }}
                    title={data}
                  >
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR" style={{ width: "100%", height: "100%", borderRadius: Math.max(0, qrRadius - 2) }} />
                    ) : (
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=${hex(qrColor)}&bgcolor=${hex(qrBg)}`} alt="QR" style={{ width: "100%", height: "100%", borderRadius: Math.max(0, qrRadius - 2) }} />
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Simple keyframes for preview entrance */}
            <style>{`
              @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
              @keyframes slide-in { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
              @keyframes zoom-in { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
              @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
              .fade-in { animation: fade-in ${animSpeed}s ease }
              .slide-in { animation: slide-in ${animSpeed}s ease }
              .zoom-in { animation: zoom-in ${animSpeed}s ease }
            `}</style>

            {/* Widget URL */}
            <div>
              {activeSection === "donations" ? (
                <>
                  {/* Donation Widget URL */}
                  <div className="mb-6">
                    <Label className="text-lg font-medium mb-3 block">1. Donation Widget URL (for streaming)</Label>
                    <Input placeholder="Enter your token address." className="bg-black/50 border-gray-700 text-white mb-2" />
                    <p className="text-xs text-gray-400">Developer Wallet address is required.</p>
                  </div>

                  {/* Donate Me Page URL */}
                  <div className="mb-6">
                    <Label className="text-lg font-medium mb-3 block">2. Donate Me Page URL (for sharing)</Label>
                    <Input placeholder="Enter your token address." className="bg-black/50 border-gray-700 text-white mb-2" />
                    <p className="text-xs text-gray-400">Developer Wallet address is required.</p>
                  </div>
                </>
              ) : activeSection === "chat-widget" ? (
                <>
              <Input placeholder="Enter your token address." className="bg-black/50 border-gray-700 text-white mb-3" />
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox id="preview-link" />
                <Label htmlFor="preview-link" className="text-sm">
                  Generate temporary preview link
                </Label>
              </div>
              <p className="text-xs text-gray-400">
                The preview link will cycle through all tiers indefinitely instead of reacting to live trades.
              </p>
                </>
              ) : (
                <>
                  <Label className="text-lg font-medium mb-3 block">Widget URL</Label>
                  <div className="flex gap-2 mb-3">
                    <Input value={buildWidgetUrl()} readOnly className="bg-black/50 border-gray-700 text-white" />
                    <Button onClick={() => { navigator.clipboard.writeText(buildWidgetUrl()) }} className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white">Copy</Button>
            </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox id="preview-link" />
                    <Label htmlFor="preview-link" className="text-sm">
                      Generate temporary preview link
                    </Label>
                  </div>
                  <p className="text-xs text-gray-400">
                    The preview link will cycle through all tiers indefinitely instead of reacting to live trades.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletSelect={handleWalletSelect}
      />
    </div>
  )
}
