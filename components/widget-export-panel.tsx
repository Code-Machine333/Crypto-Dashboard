"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Download, 
  Image, 
  FileText, 
  FileImage, 
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Check,
  Loader2
} from "lucide-react"
import { EXPORT_PRESETS, downloadWidget, ExportOptions } from "@/lib/widget-export"

interface WidgetExportPanelProps {
  widgetRef: React.RefObject<HTMLElement>
  widgetName?: string
  onExportStart?: () => void
  onExportComplete?: (result: any) => void
  onExportError?: (error: string) => void
}

export function WidgetExportPanel({ 
  widgetRef, 
  widgetName = "widget",
  onExportStart,
  onExportComplete,
  onExportError 
}: WidgetExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf' | 'svg'>('png')
  const [exportQuality, setExportQuality] = useState(0.9)
  const [exportScale, setExportScale] = useState(2)
  const [customFilename, setCustomFilename] = useState("")
  const [exportSize, setExportSize] = useState<'auto' | 'custom'>('auto')
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)
  const [backgroundColor, setBackgroundColor] = useState("#000000")

  const handleExport = async (preset?: ExportOptions) => {
    if (!widgetRef.current) {
      onExportError?.("Widget element not found")
      return
    }

    setIsExporting(true)
    onExportStart?.()

    try {
      const options: ExportOptions = preset || {
        format: exportFormat,
        quality: exportQuality,
        scale: exportScale,
        filename: customFilename || `${widgetName}-export.${exportFormat}`,
        backgroundColor: backgroundColor
      }

      if (exportSize === 'custom') {
        options.width = customWidth
        options.height = customHeight
      }

      await downloadWidget(widgetRef.current, options)
      onExportComplete?.({ format: exportFormat, filename: options.filename })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Export failed"
      onExportError?.(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'png':
      case 'jpg':
        return Image
      case 'pdf':
        return FileText
      case 'svg':
        return FileImage
      default:
        return Download
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'png':
        return "High quality with transparency support"
      case 'jpg':
        return "Smaller file size, good for photos"
      case 'pdf':
        return "Vector format, perfect for printing"
      case 'svg':
        return "Scalable vector graphics"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Export Widget
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Export your widget in various formats and sizes
        </p>
      </div>

      {/* Quick Export Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Export</CardTitle>
          <CardDescription>
            Choose from predefined export settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(EXPORT_PRESETS).map(([name, preset]) => {
              const Icon = getFormatIcon(preset.format)
              return (
                <Button
                  key={name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => handleExport(preset)}
                  disabled={isExporting}
                >
                  <Icon className="w-6 h-6" />
                  <div className="text-sm font-medium capitalize">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {preset.format.toUpperCase()}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Export</CardTitle>
          <CardDescription>
            Configure your own export settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['png', 'jpg', 'pdf', 'svg'] as const).map((format) => {
                const Icon = getFormatIcon(format)
                return (
                  <Button
                    key={format}
                    variant={exportFormat === format ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setExportFormat(format)}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-sm font-medium uppercase">
                      {format}
                    </div>
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500">
              {getFormatDescription(exportFormat)}
            </p>
          </div>

          {/* Quality Settings */}
          {(exportFormat === 'png' || exportFormat === 'jpg') && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quality: {Math.round(exportQuality * 100)}%
              </Label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={exportQuality}
                onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Scale Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Scale: {exportScale}x
            </Label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={exportScale}
              onChange={(e) => setExportScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Higher scale = better quality but larger file size
            </p>
          </div>

          {/* Size Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Size</Label>
            <div className="flex gap-3">
              <Button
                variant={exportSize === 'auto' ? "default" : "outline"}
                size="sm"
                onClick={() => setExportSize('auto')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Auto
              </Button>
              <Button
                variant={exportSize === 'custom' ? "default" : "outline"}
                size="sm"
                onClick={() => setExportSize('custom')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Custom
              </Button>
            </div>
            
            {exportSize === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Width (px)</Label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 800)}
                    min="100"
                    max="4000"
                  />
                </div>
                <div>
                  <Label className="text-sm">Height (px)</Label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 600)}
                    min="100"
                    max="4000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filename</Label>
            <Input
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={`${widgetName}-export.${exportFormat}`}
            />
          </div>

          {/* Export Button */}
          <Button
            onClick={() => handleExport()}
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export Widget
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>PNG:</strong> Best for widgets with transparency or sharp edges
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>JPG:</strong> Smaller file size, good for sharing on social media
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>PDF:</strong> Perfect for printing or professional presentations
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SVG:</strong> Scalable vector format, great for web use
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
