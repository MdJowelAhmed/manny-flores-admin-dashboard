import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { SafetyChecklistSubmission } from '../dailySafetyReportsData'
import { cn } from '@/utils/cn'

interface SafetyChecklistCardProps {
  submission: SafetyChecklistSubmission
  onViewReport: (submission: SafetyChecklistSubmission) => void
}

export function SafetyChecklistCard({ submission, onViewReport }: SafetyChecklistCardProps) {
  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-bold text-foreground">{submission.projectName}</h4>
          <Badge
            className={cn(
              'shrink-0 text-xs border-0',
              submission.status === 'Reviewed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            )}
          >
            {submission.status}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{submission.supervisorName}</p>
          <p className="text-sm text-muted-foreground">{submission.supervisorRole}</p>
        </div>
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">Date Submitted</p>
          <p className="text-sm font-medium text-foreground mt-0.5">{submission.dateSubmitted}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white h-9"
          onClick={() => onViewReport(submission)}
        >
          View Report
        </Button>
      </CardFooter>
    </Card>
  )
}
