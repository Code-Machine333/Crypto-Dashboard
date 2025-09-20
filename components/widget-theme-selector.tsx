"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Eye, 
  Download, 
  Settings,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Gamepad2,
  Briefcase
} from "lucide-react"
import { WIDGET_THEMES, WidgetTheme, getThemeById, applyThemeToConfig } from "@/lib/widget-themes"

interface WidgetThemeSelectorProps {
  currentTheme?: string
  onThemeSelect: (theme: WidgetTheme) => void
  onPreview?: (theme: WidgetTheme) => void
  onExport?: (theme: WidgetTheme) => void
}

export function WidgetThemeSelector({ 
  currentTheme, 
  onThemeSelect, 
  onPreview,
  onExport 
}: WidgetThemeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [previewTheme, setPreviewTheme] = useState<WidgetTheme | null>(null)

  const categories = [
    { id: "all", name: "All Themes", icon: Palette },
    { id: "crypto", name: "Crypto", icon: Zap },
    { id: "gaming", name: "Gaming", icon: Gamepad2 },
    { id: "professional", name: "Professional", icon: Briefcase },
    { id: "minimal", name: "Minimal", icon: Moon },
    { id: "neon", name: "Neon", icon: Sparkles }
  ]

  const filteredThemes = selectedCategory === "all" 
    ? WIDGET_THEMES 
    : WIDGET_THEMES.filter(theme => theme.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData?.icon || Palette
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      crypto: "bg-orange-500",
      gaming: "bg-green-500", 
      professional: "bg-blue-500",
      minimal: "bg-gray-500",
      neon: "bg-purple-500"
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Widget Themes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from professionally designed themes to match your brand
        </p>
      </div>

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

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => {
          const CategoryIcon = getCategoryIcon(theme.category)
          const isSelected = currentTheme === theme.id
          const isPreviewing = previewTheme?.id === theme.id

          return (
            <Card 
              key={theme.id} 
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
                      {theme.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {theme.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(theme.category)} text-white`}
                  >
                    {theme.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Color Preview */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color Palette
                  </div>
                  <div className="flex gap-1">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.background }}
                      title="Background"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.success }}
                      title="Success"
                    />
                  </div>
                </div>

                {/* Theme Features */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Features
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {theme.effects.glow && (
                      <Badge variant="outline" className="text-xs">Glow</Badge>
                    )}
                    {theme.effects.shadow && (
                      <Badge variant="outline" className="text-xs">Shadow</Badge>
                    )}
                    {theme.effects.gradient && (
                      <Badge variant="outline" className="text-xs">Gradient</Badge>
                    )}
                    {theme.effects.blur && (
                      <Badge variant="outline" className="text-xs">Blur</Badge>
                    )}
                  </div>
                </div>

                {/* Animation Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="capitalize">{theme.animations.style} animation</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Settings className="w-4 h-4" />
                    <span>{theme.typography.fontFamily.split(',')[0]}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onThemeSelect(theme)}
                    disabled={isSelected}
                  >
                    {isSelected ? "Selected" : "Select Theme"}
                  </Button>
                  
                  {onPreview && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setPreviewTheme(theme)
                        onPreview(theme)
                      }}
                      className={isPreviewing ? "bg-blue-500 text-white" : ""}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onExport && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onExport(theme)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No themes found</h3>
            <p>Try selecting a different category</p>
          </div>
        </div>
      )}

      {/* Theme Preview Info */}
      {previewTheme && (
        <Card className="border-blue-500 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Previewing: {previewTheme.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {previewTheme.description}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => {
                  onThemeSelect(previewTheme)
                  setPreviewTheme(null)
                }}
              >
                Apply Theme
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setPreviewTheme(null)}
              >
                Cancel Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
