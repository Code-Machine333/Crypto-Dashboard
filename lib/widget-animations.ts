export interface AnimationConfig {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'glow' | 'pulse' | 'shake' | 'rotate' | 'scale'
  duration: number
  delay?: number
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'cubic-bezier'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  iterationCount?: number | 'infinite'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  customEasing?: string
}

export interface WidgetAnimation {
  id: string
  name: string
  description: string
  category: 'entrance' | 'exit' | 'attention' | 'continuous'
  config: AnimationConfig
  css: string
  keyframes: string
}

export const WIDGET_ANIMATIONS: WidgetAnimation[] = [
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Smooth fade in effect',
    category: 'entrance',
    config: {
      type: 'fade',
      duration: 600,
      easing: 'ease-out',
      fillMode: 'both'
    },
    css: 'fade-in',
    keyframes: `
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    description: 'Slide in from bottom',
    category: 'entrance',
    config: {
      type: 'slide',
      duration: 500,
      easing: 'ease-out',
      fillMode: 'both'
    },
    css: 'slide-up',
    keyframes: `
      @keyframes slide-up {
        from { 
          opacity: 0;
          transform: translateY(30px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Scale up from center',
    category: 'entrance',
    config: {
      type: 'zoom',
      duration: 400,
      easing: 'ease-out',
      fillMode: 'both'
    },
    css: 'zoom-in',
    keyframes: `
      @keyframes zoom-in {
        from { 
          opacity: 0;
          transform: scale(0.8);
        }
        to { 
          opacity: 1;
          transform: scale(1);
        }
      }
    `
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    description: 'Bouncy entrance effect',
    category: 'entrance',
    config: {
      type: 'bounce',
      duration: 800,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fillMode: 'both'
    },
    css: 'bounce-in',
    keyframes: `
      @keyframes bounce-in {
        0% { 
          opacity: 0;
          transform: scale(0.3);
        }
        50% { 
          opacity: 1;
          transform: scale(1.05);
        }
        70% { 
          transform: scale(0.9);
        }
        100% { 
          opacity: 1;
          transform: scale(1);
        }
      }
    `
  },
  {
    id: 'glow-pulse',
    name: 'Glow Pulse',
    description: 'Continuous glowing pulse',
    category: 'continuous',
    config: {
      type: 'glow',
      duration: 2000,
      easing: 'ease-in-out',
      iterationCount: 'infinite',
      direction: 'alternate',
      fillMode: 'both'
    },
    css: 'glow-pulse',
    keyframes: `
      @keyframes glow-pulse {
        0% { 
          box-shadow: 0 0 5px rgba(249, 115, 22, 0.5);
        }
        100% { 
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(249, 115, 22, 0.6);
        }
      }
    `
  },
  {
    id: 'shake',
    name: 'Shake',
    description: 'Attention-grabbing shake',
    category: 'attention',
    config: {
      type: 'shake',
      duration: 500,
      easing: 'ease-in-out',
      iterationCount: 3,
      fillMode: 'both'
    },
    css: 'shake',
    keyframes: `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Rotate while fading in',
    category: 'entrance',
    config: {
      type: 'rotate',
      duration: 600,
      easing: 'ease-out',
      fillMode: 'both'
    },
    css: 'rotate-in',
    keyframes: `
      @keyframes rotate-in {
        from { 
          opacity: 0;
          transform: rotate(-180deg) scale(0.5);
        }
        to { 
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      }
    `
  },
  {
    id: 'scale-pulse',
    name: 'Scale Pulse',
    description: 'Gentle scaling pulse',
    category: 'continuous',
    config: {
      type: 'scale',
      duration: 1500,
      easing: 'ease-in-out',
      iterationCount: 'infinite',
      direction: 'alternate',
      fillMode: 'both'
    },
    css: 'scale-pulse',
    keyframes: `
      @keyframes scale-pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.05); }
      }
    `
  }
]

export const getAnimationById = (id: string): WidgetAnimation | undefined => {
  return WIDGET_ANIMATIONS.find(animation => animation.id === id)
}

export const getAnimationsByCategory = (category: string): WidgetAnimation[] => {
  return WIDGET_ANIMATIONS.filter(animation => animation.category === category)
}

export const generateAnimationCSS = (animation: WidgetAnimation): string => {
  return `
    ${animation.keyframes}
    
    .${animation.css} {
      animation: ${animation.id} ${animation.config.duration}ms ${animation.config.easing} ${animation.config.delay || 0}ms ${animation.config.iterationCount || 1} ${animation.config.direction || 'normal'} ${animation.config.fillMode || 'both'};
    }
  `
}

export const applyAnimationToElement = (
  element: HTMLElement,
  animation: WidgetAnimation
): void => {
  // Remove existing animation classes
  WIDGET_ANIMATIONS.forEach(anim => {
    element.classList.remove(anim.css)
  })
  
  // Add new animation class
  element.classList.add(animation.css)
  
  // Inject CSS if not already present
  const styleId = `animation-${animation.id}`
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = generateAnimationCSS(animation)
    document.head.appendChild(style)
  }
}

export const createCustomAnimation = (
  id: string,
  name: string,
  description: string,
  category: string,
  keyframes: string,
  config: AnimationConfig
): WidgetAnimation => {
  return {
    id,
    name,
    description,
    category: category as any,
    config,
    css: id,
    keyframes
  }
}

export const generateRandomAnimation = (): WidgetAnimation => {
  const entranceAnimations = getAnimationsByCategory('entrance')
  const randomIndex = Math.floor(Math.random() * entranceAnimations.length)
  return entranceAnimations[randomIndex]
}

export const createSequenceAnimation = (
  animations: WidgetAnimation[],
  delays: number[] = []
): string => {
  const sequenceCSS = animations.map((anim, index) => {
    const delay = delays[index] || index * 200
    return `
      .sequence-${index} {
        animation: ${anim.id} ${anim.config.duration}ms ${anim.config.easing} ${delay}ms ${anim.config.iterationCount || 1} ${anim.config.direction || 'normal'} ${anim.config.fillMode || 'both'};
      }
    `
  }).join('\n')
  
  const keyframes = animations.map(anim => anim.keyframes).join('\n')
  
  return `${keyframes}\n${sequenceCSS}`
}

// Animation presets for different widget types
export const WIDGET_ANIMATION_PRESETS = {
  'market-cap': {
    entrance: 'slide-up',
    continuous: 'glow-pulse',
    attention: 'shake'
  },
  'donations': {
    entrance: 'bounce-in',
    continuous: 'scale-pulse',
    attention: 'glow-pulse'
  },
  'buy-bot': {
    entrance: 'zoom-in',
    continuous: 'glow-pulse',
    attention: 'shake'
  },
  'chat-widget': {
    entrance: 'fade-in',
    continuous: null,
    attention: 'scale-pulse'
  },
  'burn-goals': {
    entrance: 'rotate-in',
    continuous: 'glow-pulse',
    attention: 'shake'
  },
  'subathon-timer': {
    entrance: 'bounce-in',
    continuous: 'glow-pulse',
    attention: 'scale-pulse'
  }
}
