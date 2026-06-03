import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Render an invoice DOM node into an A4 PDF. The node is captured with
 * html2canvas and sliced across as many A4 pages as needed.
 *
 * - `mode: 'download'` saves the file directly.
 * - `mode: 'print'`    opens the PDF in a new tab and triggers the print
 *                      dialog (where the user can also "Save as PDF").
 */
export async function generateInvoicePdf(
  node: HTMLElement,
  fileName: string,
  mode: 'download' | 'print' = 'download'
): Promise<void> {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 24
  const usableWidth = pageWidth - margin * 2
  const ratio = usableWidth / canvas.width
  const imgHeight = canvas.height * ratio

  const imgData = canvas.toDataURL('image/png')

  if (imgHeight <= pageHeight - margin * 2) {
    pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight)
  } else {
    // Slice the tall canvas into A4-sized page chunks.
    const pageCanvasHeight = (pageHeight - margin * 2) / ratio
    let renderedHeight = 0
    let pageIndex = 0

    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight)

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sliceHeight
      const ctx = pageCanvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        )
      }

      if (pageIndex > 0) pdf.addPage()
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        margin,
        margin,
        usableWidth,
        sliceHeight * ratio
      )

      renderedHeight += sliceHeight
      pageIndex += 1
    }
  }

  if (mode === 'download') {
    pdf.save(fileName)
    return
  }

  // Print: open in a new tab and auto-trigger the print dialog.
  pdf.autoPrint()
  const blobUrl = pdf.output('bloburl')
  const printWindow = window.open(blobUrl as unknown as string, '_blank')
  if (!printWindow) {
    // Popup blocked — fall back to downloading the file instead.
    pdf.save(fileName)
  }
}
