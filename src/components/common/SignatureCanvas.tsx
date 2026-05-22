import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface SignatureCanvasHandle {
  clear: () => void
  isEmpty: () => boolean
  getDataUrl: () => string | null
}

interface SignatureCanvasProps {
  label?: string
  helperText?: string
  className?: string
  canvasClassName?: string
  clearLabel?: string
  disabled?: boolean
  onChange?: (hasStroke: boolean) => void
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  function SignatureCanvas(
    {
      label,
      helperText,
      className,
      canvasClassName,
      clearLabel,
      disabled = false,
      onChange,
    },
    ref
  ) {
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
      if (disabled) return
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      drawing.current = true
      const { x, y } = getPoint(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      canvasRef.current?.setPointerCapture(e.pointerId)
    }

    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled || !drawing.current) return
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const { x, y } = getPoint(e)
      ctx.lineTo(x, y)
      ctx.stroke()
      if (!hasStroke) {
        setHasStroke(true)
        onChange?.(true)
      }
    }

    const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
      drawing.current = false
      if (canvasRef.current?.hasPointerCapture?.(e.pointerId)) {
        canvasRef.current.releasePointerCapture(e.pointerId)
      }
    }

    const clearCanvas = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, rect.width, rect.height)
      setHasStroke(false)
      onChange?.(false)
    }

    useImperativeHandle(
      ref,
      () => ({
        clear: clearCanvas,
        isEmpty: () => !hasStroke,
        getDataUrl: () =>
          hasStroke ? canvasRef.current?.toDataURL('image/png') ?? null : null,
      }),
      [hasStroke]
    )

    return (
      <div className={cn('flex h-full flex-col', className)}>
        {label && (
          <div className="flex h-7 items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {label}
            </span>
            {!disabled ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                onClick={clearCanvas}
                disabled={!hasStroke}
              >
                <Eraser className="mr-1 h-3.5 w-3.5" />
                {clearLabel ?? t('common.signature.clear', 'Clear')}
              </Button>
            ) : (
              <span aria-hidden className="h-7" />
            )}
          </div>
        )}
        <canvas
          ref={canvasRef}
          aria-disabled={disabled || undefined}
          className={cn(
            'mt-2 h-36 w-full touch-none rounded-lg border-2 border-dashed border-gray-300 bg-white cursor-crosshair',
            disabled && 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60',
            canvasClassName
          )}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <p
          className={cn(
            'mt-2 min-h-[1rem] text-xs text-gray-500',
            !helperText && 'invisible'
          )}
        >
          {helperText || '\u00a0'}
        </p>
      </div>
    )
  }
)
