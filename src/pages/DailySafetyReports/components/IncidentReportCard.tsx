import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { IncidentReportSubmission } from '../dailySafetyReportsData'

interface IncidentReportCardProps {
  submission: IncidentReportSubmission
  onViewReport: (submission: IncidentReportSubmission) => void
}

export function IncidentReportCard({ submission, onViewReport }: IncidentReportCardProps) {
  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <h4 className="font-bold text-foreground mb-2">{submission.projectName}</h4>
        <p className="font-medium text-foreground mb-3">{submission.reporterName}</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground">Incident Type:</span>
            <span className="text-foreground">{submission.incidentType}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground">Date & Time:</span>
            <span className="text-foreground">{submission.dateTime}</span>
          </div>
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
