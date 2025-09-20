export interface WidgetTemplate {
  id: string
  name: string
  description: string
  category: string
  config: Record<string, any>
  preview: string
  tags: string[]
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'market-cap-classic',
    name: 'Classic Market Cap',
    description: 'Clean, minimal market cap display with price and change',
    category: 'Market Data',
    config: {
      colorStyle: 'gradient',
      showChange: true,
      showVolume: false,
      fontSize: 'large',
      animation: 'fade'
    },
    preview: '/templates/market-cap-classic.png',
    tags: ['minimal', 'clean', 'professional']
  },
  {
    id: 'donations-streamer',
    name: 'Streamer Donations',
    description: 'Gaming-focused donation widget with sound effects',
    category: 'Donations',
    config: {
      colorStyle: 'gaming',
      showAvatar: true,
      soundEnabled: true,
      animation: 'bounce',
      showGoal: true
    },
    preview: '/templates/donations-streamer.png',
    tags: ['gaming', 'interactive', 'sounds']
  },
  {
    id: 'buy-bot-alerts',
    name: 'Buy Bot Alerts',
    description: 'Real-time buy alerts with token information',
    category: 'Trading',
    config: {
      colorStyle: 'neon',
      showTokenInfo: true,
      animation: 'slide',
      showAmount: true,
      showWallet: false
    },
    preview: '/templates/buy-bot-alerts.png',
    tags: ['trading', 'alerts', 'real-time']
  },
  {
    id: 'chat-integration',
    name: 'Chat Integration',
    description: 'Twitch/Discord chat integration with moderation',
    category: 'Community',
    config: {
      colorStyle: 'dark',
      showTimestamps: true,
      moderationEnabled: true,
      showBadges: true,
      maxMessages: 10
    },
    preview: '/templates/chat-integration.png',
    tags: ['community', 'moderation', 'social']
  },
  {
    id: 'burn-goals-progress',
    name: 'Burn Goals Progress',
    description: 'Token burn tracking with progress visualization',
    category: 'Goals',
    config: {
      colorStyle: 'fire',
      showProgress: true,
      animation: 'pulse',
      showPercentage: true,
      showTimeRemaining: true
    },
    preview: '/templates/burn-goals-progress.png',
    tags: ['goals', 'progress', 'visualization']
  },
  {
    id: 'subathon-timer',
    name: 'Subathon Timer',
    description: 'Interactive subathon timer with extensions',
    category: 'Events',
    config: {
      colorStyle: 'party',
      showExtensions: true,
      animation: 'glow',
      showDonations: true,
      showSubs: true
    },
    preview: '/templates/subathon-timer.png',
    tags: ['events', 'timer', 'interactive']
  }
]

export const getTemplatesByCategory = (category: string): WidgetTemplate[] => {
  return WIDGET_TEMPLATES.filter(template => template.category === category)
}

export const getTemplateById = (id: string): WidgetTemplate | undefined => {
  return WIDGET_TEMPLATES.find(template => template.id === id)
}

export const searchTemplates = (query: string): WidgetTemplate[] => {
  const lowercaseQuery = query.toLowerCase()
  return WIDGET_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}
