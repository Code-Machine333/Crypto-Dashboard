import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg'
  quality: number
  width?: number
  height?: number
  backgroundColor?: string
  scale?: number
  filename?: string
}

export interface ExportResult {
  success: boolean
  data?: string | Blob
  error?: string
  filename?: string
}

export class WidgetExporter {
  private static instance: WidgetExporter

  static getInstance(): WidgetExporter {
    if (!WidgetExporter.instance) {
      WidgetExporter.instance = new WidgetExporter()
    }
    return WidgetExporter.instance
  }

  async exportWidget(
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'png':
        case 'jpg':
          return await this.exportAsImage(element, options)
        case 'pdf':
          return await this.exportAsPDF(element, options)
        case 'svg':
          return await this.exportAsSVG(element, options)
        default:
          throw new Error(`Unsupported format: ${options.format}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async exportAsImage(
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#000000',
      scale: options.scale || 2,
      width: options.width,
      height: options.height,
      useCORS: true,
      allowTaint: true,
      logging: false
    })

    const dataURL = canvas.toDataURL(
      `image/${options.format}`,
      options.quality || 0.9
    )

    return {
      success: true,
      data: dataURL,
      filename: options.filename || `widget-export.${options.format}`
    }
  }

  private async exportAsPDF(
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#000000',
      scale: options.scale || 2,
      width: options.width,
      height: options.height,
      useCORS: true,
      allowTaint: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)

    const pdfBlob = pdf.output('blob')

    return {
      success: true,
      data: pdfBlob,
      filename: options.filename || 'widget-export.pdf'
    }
  }

  private async exportAsSVG(
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Convert HTML element to SVG
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(element)
    
    // Create SVG wrapper
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${options.width || element.offsetWidth}" 
           height="${options.height || element.offsetHeight}"
           viewBox="0 0 ${options.width || element.offsetWidth} ${options.height || element.offsetHeight}">
        <foreignObject width="100%" height="100%">
          ${svgString}
        </foreignObject>
      </svg>
    `

    const blob = new Blob([svg], { type: 'image/svg+xml' })

    return {
      success: true,
      data: blob,
      filename: options.filename || 'widget-export.svg'
    }
  }

  downloadFile(data: string | Blob, filename: string): void {
    const url = data instanceof Blob ? URL.createObjectURL(data) : data
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    if (data instanceof Blob) {
      URL.revokeObjectURL(url)
    }
  }

  async generateGIF(
    element: HTMLElement,
    duration: number = 3000,
    frameRate: number = 10
  ): Promise<ExportResult> {
    try {
      // This would require a GIF generation library like gif.js
      // For now, we'll return a placeholder
      return {
        success: false,
        error: 'GIF export not yet implemented'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GIF generation failed'
      }
    }
  }

  async generateVideo(
    element: HTMLElement,
    duration: number = 5000,
    frameRate: number = 30
  ): Promise<ExportResult> {
    try {
      // This would require video generation capabilities
      // For now, we'll return a placeholder
      return {
        success: false,
        error: 'Video export not yet implemented'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed'
      }
    }
  }
}

// Export utility functions
export const exportWidget = async (
  element: HTMLElement,
  options: ExportOptions
): Promise<ExportResult> => {
  const exporter = WidgetExporter.getInstance()
  return await exporter.exportWidget(element, options)
}

export const downloadWidget = async (
  element: HTMLElement,
  options: ExportOptions
): Promise<void> => {
  const exporter = WidgetExporter.getInstance()
  const result = await exporter.exportWidget(element, options)
  
  if (result.success && result.data && result.filename) {
    exporter.downloadFile(result.data, result.filename)
  } else {
    throw new Error(result.error || 'Export failed')
  }
}

// Predefined export presets
export const EXPORT_PRESETS = {
  highQuality: {
    format: 'png' as const,
    quality: 1.0,
    scale: 3
  },
  webOptimized: {
    format: 'jpg' as const,
    quality: 0.8,
    scale: 2
  },
  printReady: {
    format: 'pdf' as const,
    quality: 1.0,
    scale: 3
  },
  vector: {
    format: 'svg' as const,
    quality: 1.0
  }
}
