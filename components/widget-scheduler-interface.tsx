"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Calendar, 
  Play, 
  Pause, 
  Plus,
  Edit,
  Trash2,
  Settings,
  Bell,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { 
  widgetScheduler, 
  ScheduleRule, 
  RULE_TEMPLATES 
} from "@/lib/widget-scheduler"

interface WidgetSchedulerInterfaceProps {
  onRuleCreate?: (rule: ScheduleRule) => void
  onRuleUpdate?: (rule: ScheduleRule) => void
  onRuleDelete?: (ruleId: string) => void
}

export function WidgetSchedulerInterface({ 
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete
}: WidgetSchedulerInterfaceProps) {
  const [rules, setRules] = useState<ScheduleRule[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRule, setEditingRule] = useState<ScheduleRule | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // Load existing rules
    setRules(widgetScheduler.getAllRules())
    setIsRunning(false) // Will be updated by event listeners

    // Listen for scheduler events
    const handleRuleUpdate = () => {
      setRules(widgetScheduler.getAllRules())
    }

    widgetScheduler.on('rule-created', handleRuleUpdate)
    widgetScheduler.on('rule-updated', handleRuleUpdate)
    widgetScheduler.on('rule-deleted', handleRuleUpdate)

    return () => {
      widgetScheduler.off('rule-created', handleRuleUpdate)
      widgetScheduler.off('rule-updated', handleRuleUpdate)
      widgetScheduler.off('rule-deleted', handleRuleUpdate)
    }
  }, [])

  const handleStartScheduler = () => {
    widgetScheduler.start()
    setIsRunning(true)
  }

  const handleStopScheduler = () => {
    widgetScheduler.stop()
    setIsRunning(false)
  }

  const handleCreateFromTemplate = (template: any) => {
    const ruleId = widgetScheduler.addRule({
      name: template.name,
      description: template.description,
      type: template.type,
      enabled: true,
      config: template.config,
      actions: template.actions,
      priority: 1
    })
    
    const newRule = widgetScheduler.getRule(ruleId)
    if (newRule) {
      onRuleCreate?.(newRule)
    }
  }

  const handleDeleteRule = (ruleId: string) => {
    widgetScheduler.removeRule(ruleId)
    onRuleDelete?.(ruleId)
  }

  const handleToggleRule = (ruleId: string) => {
    const rule = widgetScheduler.getRule(ruleId)
    if (rule) {
      widgetScheduler.updateRule(ruleId, { enabled: !rule.enabled })
      onRuleUpdate?.(rule)
    }
  }

  const getRuleStatusIcon = (rule: ScheduleRule) => {
    if (!rule.enabled) {
      return <XCircle className="w-4 h-4 text-gray-400" />
    }
    
    const stats = widgetScheduler.getRuleStatistics(rule.id)
    if (stats.totalExecutions === 0) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'time':
        return <Clock className="w-4 h-4" />
      case 'interval':
        return <Zap className="w-4 h-4" />
      case 'event':
        return <Bell className="w-4 h-4" />
      case 'condition':
        return <Target className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const formatScheduleInfo = (rule: ScheduleRule) => {
    switch (rule.type) {
      case 'time':
        return `${rule.config.startTime || 'N/A'} - ${rule.config.endTime || 'N/A'}`
      case 'interval':
        return `Every ${Math.round((rule.config.interval || 0) / 1000)}s`
      case 'event':
        return `On ${rule.config.event} (${rule.config.threshold || 'any'})`
      case 'condition':
        return 'Custom condition'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Widget Scheduler
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Automate widget behavior with smart scheduling
        </p>
      </div>

      {/* Scheduler Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Scheduler Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isRunning ? 'Running' : 'Stopped'}
              </span>
              <Badge variant="outline" className="text-xs">
                {rules.length} rules
              </Badge>
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <Button size="sm" variant="outline" onClick={handleStopScheduler}>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button size="sm" onClick={handleStartScheduler}>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
          <CardDescription>
            Create common scheduling rules instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(RULE_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <div className="flex items-center gap-2 w-full">
                  {getRuleTypeIcon(template.type)}
                  <span className="font-medium">{template.name}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                  {template.description}
                </p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Scheduled Rules</CardTitle>
              <CardDescription>
                Manage your widget automation rules
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No rules created</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first scheduling rule to get started
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const stats = widgetScheduler.getRuleStatistics(rule.id)
                return (
                  <div 
                    key={rule.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getRuleStatusIcon(rule)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${rule.enabled ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rule.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {getRuleTypeIcon(rule.type)}
                            {formatScheduleInfo(rule)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {stats.totalExecutions} executions
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRule(rule.id)}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {rules.filter(r => r.enabled).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Rules
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {rules.reduce((sum, rule) => {
                    const stats = widgetScheduler.getRuleStatistics(rule.id)
                    return sum + stats.totalExecutions
                  }, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Executions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {rules.reduce((sum, rule) => {
                    const stats = widgetScheduler.getRuleStatistics(rule.id)
                    return sum + stats.successfulExecutions
                  }, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Successful
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {rules.reduce((sum, rule) => {
                    const stats = widgetScheduler.getRuleStatistics(rule.id)
                    return sum + stats.failedExecutions
                  }, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Failed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
