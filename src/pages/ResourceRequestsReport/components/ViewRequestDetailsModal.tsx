import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { ResourceRequest } from '../resourceRequestsData'
import { cn } from '@/utils/cn'

interface ViewRequestDetailsModalProps {
  open: boolean
  onClose: () => void
  record: ResourceRequest | null
  onApproved?: () => void
}

function DetailRow({
  label,
  value,
  valueHighlight,
}: {
  label: string
  value: string
  valueHighlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'text-sm font-medium',
          valueHighlight ? 'text-red-600' : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ViewRequestDetailsModal({
  open,
  onClose,
  record,
  onApproved,
}: ViewRequestDetailsModalProps) {
  if (!record) return null

  const title = `${record.resource} Request`
  const attachments = record.attachments ?? []

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      className="max-w-md"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Basic Information
          </h3>
          <div className="space-y-1">
            <DetailRow
              label="Equipment Name"
              value={record.equipmentName ?? record.resource}
            />
            <DetailRow label="Type" value={record.type} />
            <DetailRow label="Project Name" value={record.project} />
            <DetailRow
              label="Urgency Level"
              value={record.urgency}
              valueHighlight={record.urgency === 'High'}
            />
            <DetailRow label="Reason" value={record.reason ?? '-'} />
          </div>
        </div>

        {attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Attachments ({attachments.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {attachments.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Attachment ${i + 1}`}
                  className="h-20 w-28 object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/112x80/e5e7eb/9ca3af?text=Image'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white mt-4"
          onClick={() => {
            onApproved?.()
            onClose()
          }}
        >
          Approved
        </Button>
      </div>
    </ModalWrapper>
  )
}
