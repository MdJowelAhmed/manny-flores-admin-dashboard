import React, { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

interface ModalWrapperProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Renders at bottom of modal, stays fixed when content scrolls */
  footer?: React.ReactNode
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
}

export function ModalWrapper({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  footer,
}: ModalWrapperProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(sizeClasses[size], className, 'flex flex-col max-h-[90vh]')}
        onWheel={(e) => {
          const el = scrollRef.current
          if (!el) return
          if (e.defaultPrevented) return
          if (!e.deltaY) return

          // Ensure wheel scroll works even when pointer is over non-scrollable children.
          // Skip if the scroll container can't scroll.
          const canScroll = el.scrollHeight > el.clientHeight
          if (!canScroll) return

          const next = el.scrollTop + e.deltaY
          el.scrollTop = next
          e.preventDefault()
        }}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 scrollbar-thin">
          {children}
        </div>
        {footer && <div className="flex-shrink-0 pt-4 mt-2 border-t">{footer}</div>}
      </DialogContent>
    </Dialog>
  )
}




