export interface WidgetTheme {
  id: string
  name: string
  description: string
  category: 'gaming' | 'professional' | 'crypto' | 'minimal' | 'neon' | 'dark'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
    success: string
    warning: string
    error: string
  }
  typography: {
    fontFamily: string
    fontWeight: number
    letterSpacing: number
  }
  animations: {
    style: 'fade' | 'slide' | 'zoom' | 'bounce' | 'glow'
    speed: number
    easing: string
  }
  effects: {
    glow: boolean
    shadow: boolean
    gradient: boolean
    blur: boolean
  }
}

export const WIDGET_THEMES: WidgetTheme[] = [
  {
    id: 'crypto-orange',
    name: 'Crypto Orange',
    description: 'Classic crypto theme with orange accents',
    category: 'crypto',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#000000',
      text: '#ffffff',
      border: '#f97316',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: 0.5
    },
    animations: {
      style: 'fade',
      speed: 0.6,
      easing: 'ease-out'
    },
    effects: {
      glow: true,
      shadow: true,
      gradient: true,
      blur: false
    }
  },
  {
    id: 'gaming-neon',
    name: 'Gaming Neon',
    description: 'Bright neon colors for gaming streams',
    category: 'gaming',
    colors: {
      primary: '#00ff88',
      secondary: '#00cc6a',
      accent: '#33ff99',
      background: '#0a0a0a',
      text: '#ffffff',
      border: '#00ff88',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff3366'
    },
    typography: {
      fontFamily: 'Orbitron, monospace',
      fontWeight: 700,
      letterSpacing: 1
    },
    animations: {
      style: 'glow',
      speed: 0.8,
      easing: 'ease-in-out'
    },
    effects: {
      glow: true,
      shadow: true,
      gradient: true,
      blur: true
    }
  },
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Clean and professional blue theme',
    category: 'professional',
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 500,
      letterSpacing: 0
    },
    animations: {
      style: 'slide',
      speed: 0.4,
      easing: 'ease-out'
    },
    effects: {
      glow: false,
      shadow: true,
      gradient: false,
      blur: false
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Minimalist dark theme with subtle accents',
    category: 'minimal',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#9ca3af',
      background: '#111827',
      text: '#f9fafb',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 400,
      letterSpacing: 0
    },
    animations: {
      style: 'fade',
      speed: 0.3,
      easing: 'ease-out'
    },
    effects: {
      glow: false,
      shadow: false,
      gradient: false,
      blur: false
    }
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    description: 'Vibrant purple neon theme',
    category: 'neon',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      background: '#0f0f23',
      text: '#ffffff',
      border: '#a855f7',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 600,
      letterSpacing: 0.8
    },
    animations: {
      style: 'bounce',
      speed: 0.7,
      easing: 'ease-in-out'
    },
    effects: {
      glow: true,
      shadow: true,
      gradient: true,
      blur: true
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic cyberpunk theme',
    category: 'gaming',
    colors: {
      primary: '#ff0080',
      secondary: '#cc0066',
      accent: '#ff3399',
      background: '#000000',
      text: '#00ffff',
      border: '#ff0080',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000'
    },
    typography: {
      fontFamily: 'Courier New, monospace',
      fontWeight: 700,
      letterSpacing: 1.2
    },
    animations: {
      style: 'glow',
      speed: 1.0,
      easing: 'ease-in-out'
    },
    effects: {
      glow: true,
      shadow: true,
      gradient: true,
      blur: true
    }
  }
]

export const getThemeById = (id: string): WidgetTheme | undefined => {
  return WIDGET_THEMES.find(theme => theme.id === id)
}

export const getThemesByCategory = (category: string): WidgetTheme[] => {
  return WIDGET_THEMES.filter(theme => theme.category === category)
}

export const applyThemeToConfig = (theme: WidgetTheme, config: any): any => {
  return {
    ...config,
    colorStyle: theme.id,
    typography: {
      typoFont: theme.typography.fontFamily,
      typoWeight: theme.typography.fontWeight,
      typoTracking: theme.typography.letterSpacing
    },
    animation: {
      animStyle: theme.animations.style,
      animSpeed: theme.animations.speed
    },
    effects: theme.effects
  }
}

export const generateCSSVariables = (theme: WidgetTheme): string => {
  return `
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-accent: ${theme.colors.accent};
    --color-background: ${theme.colors.background};
    --color-text: ${theme.colors.text};
    --color-border: ${theme.colors.border};
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    --font-family: ${theme.typography.fontFamily};
    --font-weight: ${theme.typography.fontWeight};
    --letter-spacing: ${theme.typography.letterSpacing}px;
    --animation-speed: ${theme.animations.speed}s;
    --animation-easing: ${theme.animations.easing};
  `
}
