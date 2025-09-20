"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Clock,
  Target
} from "lucide-react"
import { 
  WIDGET_ANIMATIONS, 
  WidgetAnimation, 
  getAnimationById, 
  getAnimationsByCategory,
  applyAnimationToElement,
  WIDGET_ANIMATION_PRESETS
} from "@/lib/widget-animations"

interface WidgetAnimationControllerProps {
  widgetRef: React.RefObject<HTMLElement>
  currentAnimation?: string
  onAnimationSelect: (animation: WidgetAnimation) => void
  onPreview?: (animation: WidgetAnimation) => void
  onStop?: () => void
}

export function WidgetAnimationController({ 
  widgetRef, 
  currentAnimation,
  onAnimationSelect,
  onPreview,
  onStop
}: WidgetAnimationControllerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("entrance")
  const [previewAnimation, setPreviewAnimation] = useState<WidgetAnimation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1.0)

  const categories = [
    { id: "entrance", name: "Entrance", icon: Play },
    { id: "exit", name: "Exit", icon: Pause },
    { id: "attention", name: "Attention", icon: Target },
    { id: "continuous", name: "Continuous", icon: RotateCcw }
  ]

  const filteredAnimations = selectedCategory === "all" 
    ? WIDGET_ANIMATIONS 
    : getAnimationsByCategory(selectedCategory)

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData?.icon || Play
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      entrance: "bg-green-500",
      exit: "bg-red-500", 
      attention: "bg-yellow-500",
      continuous: "bg-blue-500"
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  const handlePreview = (animation: WidgetAnimation) => {
    if (widgetRef.current) {
      applyAnimationToElement(widgetRef.current, animation)
      setPreviewAnimation(animation)
      onPreview?.(animation)
    }
  }

  const handleStop = () => {
    if (widgetRef.current) {
      // Remove all animation classes
      WIDGET_ANIMATIONS.forEach(anim => {
        widgetRef.current?.classList.remove(anim.css)
      })
      setPreviewAnimation(null)
      setIsPlaying(false)
      onStop?.()
    }
  }

  const handlePlay = () => {
    if (previewAnimation) {
      handlePreview(previewAnimation)
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    // Animation will continue but we stop the preview state
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Animation Controller
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Control and preview widget animations
        </p>
      </div>

      {/* Animation Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Presets</CardTitle>
          <CardDescription>
            Apply pre-configured animations for different widget types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(WIDGET_ANIMATION_PRESETS).map(([widgetType, presets]) => (
              <div key={widgetType} className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {widgetType.replace('-', ' ')}
                </div>
                <div className="flex gap-1">
                  {presets.entrance && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const animation = getAnimationById(presets.entrance!)
                        if (animation) handlePreview(animation)
                      }}
                      className="text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      In
                    </Button>
                  )}
                  {presets.continuous && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const animation = getAnimationById(presets.continuous!)
                        if (animation) handlePreview(animation)
                      }}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Loop
                    </Button>
                  )}
                  {presets.attention && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const animation = getAnimationById(presets.attention!)
                        if (animation) handlePreview(animation)
                      }}
                      className="text-xs"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Alert
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Animations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnimations.map((animation) => {
          const CategoryIcon = getCategoryIcon(animation.category)
          const isSelected = currentAnimation === animation.id
          const isPreviewing = previewAnimation?.id === animation.id

          return (
            <Card 
              key={animation.id} 
              className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                isSelected 
                  ? "border-orange-500 bg-orange-500/10" 
                  : isPreviewing
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-orange-500/50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5" />
                      {animation.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {animation.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(animation.category)} text-white`}
                  >
                    {animation.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Animation Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{animation.config.duration}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="capitalize">{animation.config.easing}</span>
                  </div>
                  {animation.config.iterationCount && (
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      <span>
                        {animation.config.iterationCount === 'infinite' 
                          ? 'Infinite' 
                          : `${animation.config.iterationCount}x`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onAnimationSelect(animation)}
                    disabled={isSelected}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePreview(animation)}
                    className={isPreviewing ? "bg-blue-500 text-white" : ""}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Animation Controls */}
      {(previewAnimation || isPlaying) && (
        <Card className="border-blue-500 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Animation Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewAnimation && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Playing:</strong> {previewAnimation.name}</p>
                <p><strong>Duration:</strong> {previewAnimation.config.duration}ms</p>
                <p><strong>Type:</strong> {previewAnimation.config.type}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
                variant={isPlaying ? "outline" : "default"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleStop}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Speed: {animationSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAnimations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No animations found</h3>
            <p>Try selecting a different category</p>
          </div>
        </div>
      )}
    </div>
  )
}
