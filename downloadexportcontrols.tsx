import React, { useCallback } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface DownloadExportControlsProps {
  exportRef: React.RefObject<HTMLElement>
  filename?: string
  onExportComplete?: (type: 'html' | 'pdf') => void
  className?: string
}

const DownloadExportControls: React.FC<DownloadExportControlsProps> = ({
  exportRef,
  filename = 'export',
  onExportComplete,
  className = '',
}) => {
  const exportHTML = useCallback(() => {
    if (!exportRef.current) return
    try {
      const content = exportRef.current.outerHTML
      const blob = new Blob([content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.html`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
      onExportComplete?.('html')
    } catch (error) {
      console.error('HTML export failed', error)
    }
  }, [exportRef, filename, onExportComplete])

  const exportPDF = useCallback(async () => {
    if (!exportRef.current) return
    try {
      const element = exportRef.current
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = pdf.getImageProperties(imgData)
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height)
      const imgWidth = imgProps.width * ratio
      const imgHeight = imgProps.height * ratio
      pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight)
      pdf.save(`${filename}.pdf`)
      onExportComplete?.('pdf')
    } catch (error) {
      console.error('PDF export failed', error)
    }
  }, [exportRef, filename, onExportComplete])

  return (
    <div className={`download-export-controls ${className}`}>
      <button type="button" className="btn btn-secondary" onClick={exportHTML}>
        Export HTML
      </button>
      <button type="button" className="btn btn-primary" onClick={exportPDF}>
        Export PDF
      </button>
    </div>
  )
}

export default DownloadExportControls