import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import type { SendNotificationPayload } from '@/types'
import { NOTIFICATION_TYPES } from '../constants'

interface SendNotificationModalProps {
  open: boolean
  onClose: () => void
  onSent?: (payload: SendNotificationPayload) => void | Promise<void>
}

export function SendNotificationModal({
  open,
  onClose,
  onSent,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    setTitle('')
    setMessage('')
    setType('')
    onClose()
  }

  const handleSent = async () => {
    if (!title.trim()) {
      toast({
        title: 'Validation',
        description: 'Please enter a title.',
        variant: 'destructive',
      })
      return
    }
    if (!message.trim()) {
      toast({
        title: 'Validation',
        description: 'Please enter a message.',
        variant: 'destructive',
      })
      return
    }
    if (!type) {
      toast({
        title: 'Validation',
        description: 'Please select a type.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const payload: SendNotificationPayload = {
        title: title.trim(),
        message: message.trim(),
        type: type as SendNotificationPayload['type'],
      }

      if (onSent) {
        await onSent(payload)
      } else {
        await new Promise((r) => setTimeout(r, 800))
        toast({
          title: 'Success',
          description: 'Notification sent successfully.',
          variant: 'success',
        })
      }
      handleClose()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={cn(
          'max-w-lg flex flex-col max-h-[90vh]',
          'bg-white rounded-xl border border-border shadow-lg'
        )}
      >
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-left text-lg font-bold text-slate-800">
            Write a message
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="notification-title"
              className="text-sm font-medium text-slate-700"
            >
              Title
            </Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New Offer"
              className="rounded-md border border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label
              htmlFor="notification-message"
              className="text-sm font-medium text-slate-700"
            >
              Message
            </Label>
            <Textarea
              id="notification-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="New Offer..."
              rows={4}
              className="rounded-md border border-primary/40 focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label
              htmlFor="notification-type"
              className="text-sm font-medium text-slate-700"
            >
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                id="notification-type"
                className="rounded-md border border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSent}
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
