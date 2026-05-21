import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  onCancel: () => void
  instructions?: string
  clearLabel?: string
  confirmLabel?: string
  cancelLabel?: string
}

export function SignaturePad({
  onSave,
  onCancel,
  instructions,
  clearLabel,
  confirmLabel,
  cancelLabel,
}: SignaturePadProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasStroke, setHasStroke] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#111827'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawing.current = true
    const { x, y } = getPoint(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPoint(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasStroke(true)
  }

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false
    canvasRef.current?.releasePointerCapture(e.pointerId)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasStroke(false)
  }

  const save = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasStroke) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {instructions ?? t('common.signature.instructions', 'Sign in the box below.')}
      </p>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-lg border-2 border-dashed border-gray-300 bg-white cursor-crosshair"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="flex flex-wrap gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel ?? t('common.cancel')}
        </Button>
        <Button type="button" variant="outline" onClick={clear}>
          {clearLabel ?? t('common.signature.clear', 'Clear')}
        </Button>
        <Button
          type="button"
          className="bg-primary text-white hover:bg-primary/90"
          onClick={save}
          disabled={!hasStroke}
        >
          {confirmLabel ?? t('common.signature.confirm', 'Confirm signature')}
        </Button>
      </div>
    </div>
  )
}
