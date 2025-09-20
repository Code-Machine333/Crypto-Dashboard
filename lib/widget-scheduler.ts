export interface ScheduleRule {
  id: string
  name: string
  description: string
  type: 'time' | 'interval' | 'event' | 'condition'
  enabled: boolean
  config: {
    // Time-based scheduling
    startTime?: string // HH:MM format
    endTime?: string // HH:MM format
    days?: number[] // 0-6 (Sunday-Saturday)
    timezone?: string
    
    // Interval-based scheduling
    interval?: number // milliseconds
    repeat?: boolean
    
    // Event-based scheduling
    event?: string // 'donation', 'follow', 'subscriber', etc.
    threshold?: number
    
    // Condition-based scheduling
    condition?: string // JavaScript expression
    variables?: Record<string, any>
  }
  actions: {
    show?: string // widget type to show
    hide?: string // widget type to hide
    switch?: string // widget type to switch to
    config?: Record<string, any> // configuration to apply
  }
  priority: number // higher number = higher priority
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledEvent {
  id: string
  ruleId: string
  timestamp: Date
  action: string
  data: any
  executed: boolean
  result?: any
  error?: string
}

export class WidgetScheduler {
  private static instance: WidgetScheduler
  private rules: Map<string, ScheduleRule> = new Map()
  private events: ScheduledEvent[] = []
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private isRunning: boolean = false
  private eventListeners: Map<string, Function[]> = new Map()

  static getInstance(): WidgetScheduler {
    if (!WidgetScheduler.instance) {
      WidgetScheduler.instance = new WidgetScheduler()
    }
    return WidgetScheduler.instance
  }

  // Rule management
  addRule(rule: Omit<ScheduleRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newRule: ScheduleRule = {
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.rules.set(id, newRule)
    this.scheduleRule(newRule)
    
    return id
  }

  updateRule(id: string, updates: Partial<ScheduleRule>): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    
    const updatedRule = {
      ...rule,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    }
    
    this.rules.set(id, updatedRule)
    this.unscheduleRule(id)
    this.scheduleRule(updatedRule)
    
    return true
  }

  removeRule(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    
    this.unscheduleRule(id)
    this.rules.delete(id)
    
    return true
  }

  getRule(id: string): ScheduleRule | undefined {
    return this.rules.get(id)
  }

  getAllRules(): ScheduleRule[] {
    return Array.from(this.rules.values())
  }

  // Scheduling logic
  private scheduleRule(rule: ScheduleRule): void {
    if (!rule.enabled) return

    switch (rule.type) {
      case 'time':
        this.scheduleTimeRule(rule)
        break
      case 'interval':
        this.scheduleIntervalRule(rule)
        break
      case 'event':
        this.scheduleEventRule(rule)
        break
      case 'condition':
        this.scheduleConditionRule(rule)
        break
    }
  }

  private unscheduleRule(id: string): void {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
  }

  private scheduleTimeRule(rule: ScheduleRule): void {
    const { startTime, endTime, days, timezone } = rule.config
    
    if (!startTime) return

    const now = new Date()
    const [startHour, startMinute] = startTime.split(':').map(Number)
    
    // Calculate next execution time
    let nextExecution = new Date()
    nextExecution.setHours(startHour, startMinute, 0, 0)
    
    // If time has passed today, schedule for tomorrow
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1)
    }
    
    // Check if day is allowed
    if (days && days.length > 0) {
      while (!days.includes(nextExecution.getDay())) {
        nextExecution.setDate(nextExecution.getDate() + 1)
      }
    }
    
    const delay = nextExecution.getTime() - now.getTime()
    
    const timer = setTimeout(() => {
      this.executeRule(rule)
      // Schedule next execution
      this.scheduleTimeRule(rule)
    }, delay)
    
    this.timers.set(rule.id, timer)
  }

  private scheduleIntervalRule(rule: ScheduleRule): void {
    const { interval, repeat } = rule.config
    
    if (!interval) return

    const execute = () => {
      this.executeRule(rule)
      if (repeat) {
        this.scheduleIntervalRule(rule)
      }
    }
    
    const timer = setTimeout(execute, interval)
    this.timers.set(rule.id, timer)
  }

  private scheduleEventRule(rule: ScheduleRule): void {
    const { event } = rule.config
    
    if (!event) return

    // Add event listener
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    
    const listener = (data: any) => {
      const { threshold } = rule.config
      if (!threshold || data.value >= threshold) {
        this.executeRule(rule, data)
      }
    }
    
    this.eventListeners.get(event)!.push(listener)
  }

  private scheduleConditionRule(rule: ScheduleRule): void {
    const { condition, variables } = rule.config
    
    if (!condition) return

    // Check condition periodically
    const checkCondition = () => {
      try {
        const context = { ...variables, now: new Date() }
        const result = this.evaluateCondition(condition, context)
        
        if (result) {
          this.executeRule(rule)
        }
      } catch (error) {
        console.error('Condition evaluation error:', error)
      }
    }
    
    // Check every 5 seconds
    const timer = setInterval(checkCondition, 5000)
    this.timers.set(rule.id, timer)
  }

  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    // Simple condition evaluator (in production, use a proper expression parser)
    const func = new Function(...Object.keys(context), `return ${condition}`)
    return func(...Object.values(context))
  }

  // Execution
  private executeRule(rule: ScheduleRule, data?: any): void {
    const event: ScheduledEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      timestamp: new Date(),
      action: JSON.stringify(rule.actions),
      data: data || {},
      executed: false
    }
    
    try {
      this.executeActions(rule.actions, data)
      event.executed = true
      event.result = 'Success'
    } catch (error) {
      event.error = error instanceof Error ? error.message : 'Unknown error'
    }
    
    this.events.push(event)
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
  }

  private executeActions(actions: ScheduleRule['actions'], data?: any): void {
    if (actions.show) {
      this.emit('show-widget', { type: actions.show, config: actions.config })
    }
    
    if (actions.hide) {
      this.emit('hide-widget', { type: actions.hide })
    }
    
    if (actions.switch) {
      this.emit('switch-widget', { type: actions.switch, config: actions.config })
    }
    
    if (actions.config) {
      this.emit('update-config', { config: actions.config })
    }
  }

  // Event system
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  // External event triggers
  triggerEvent(eventType: string, data: any): void {
    this.emit(eventType, data)
  }

  // Control
  start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.rules.forEach(rule => this.scheduleRule(rule))
  }

  stop(): void {
    if (!this.isRunning) return
    
    this.isRunning = false
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }

  // Statistics
  getEventHistory(limit: number = 100): ScheduledEvent[] {
    return this.events.slice(-limit)
  }

  getRuleStatistics(ruleId: string): {
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    lastExecution?: Date
  } {
    const ruleEvents = this.events.filter(event => event.ruleId === ruleId)
    
    return {
      totalExecutions: ruleEvents.length,
      successfulExecutions: ruleEvents.filter(event => event.executed).length,
      failedExecutions: ruleEvents.filter(event => !event.executed).length,
      lastExecution: ruleEvents.length > 0 ? ruleEvents[ruleEvents.length - 1].timestamp : undefined
    }
  }
}

// Export singleton instance
export const widgetScheduler = WidgetScheduler.getInstance()

// Predefined rule templates
export const RULE_TEMPLATES = {
  'business-hours': {
    name: 'Business Hours',
    description: 'Show widget during business hours (9 AM - 5 PM)',
    type: 'time' as const,
    config: {
      startTime: '09:00',
      endTime: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    },
    actions: {
      show: 'market-cap'
    }
  },
  'donation-alert': {
    name: 'Donation Alert',
    description: 'Show special widget when donation exceeds threshold',
    type: 'event' as const,
    config: {
      event: 'donation',
      threshold: 10 // $10
    },
    actions: {
      show: 'donations',
      config: { highlight: true }
    }
  },
  'hourly-update': {
    name: 'Hourly Update',
    description: 'Update widget every hour',
    type: 'interval' as const,
    config: {
      interval: 3600000, // 1 hour
      repeat: true
    },
    actions: {
      config: { refresh: true }
    }
  },
  'peak-hours': {
    name: 'Peak Hours',
    description: 'Show special widget during peak streaming hours',
    type: 'time' as const,
    config: {
      startTime: '19:00',
      endTime: '23:00',
      days: [0, 1, 2, 3, 4, 5, 6] // Every day
    },
    actions: {
      show: 'buy-bot',
      config: { enhanced: true }
    }
  }
}
