import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, CheckCircle2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/Form'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import type { PayrollRecord } from '../payrollData'

function startOfWeek(d: Date) {
  const date = new Date(d)
  const day = date.getDay() // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7 // Monday start
  date.setDate(date.getDate() - diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfWeek(d: Date) {
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(s.getDate() + 6)
  e.setHours(23, 59, 59, 999)
  return e
}

interface WeeklyPayrollRunCardProps {
  records: PayrollRecord[]
  onMarkPaid: (recordIds: string[]) => void
  canTriggerQuickBooks?: boolean
  onTriggerQuickBooks?: (recordIds: string[]) => void
}

export function WeeklyPayrollRunCard({
  records,
  onMarkPaid,
  canTriggerQuickBooks = false,
  onTriggerQuickBooks,
}: WeeklyPayrollRunCardProps) {
  const { t } = useTranslation()
  const [weekDate, setWeekDate] = useState<Date | undefined>(new Date())

  const { weekStart, weekEnd } = useMemo(() => {
    const base = weekDate ?? new Date()
    return { weekStart: startOfWeek(base), weekEnd: endOfWeek(base) }
  }, [weekDate])

  const pending = useMemo(() => records.filter((r) => r.status === 'Pending'), [records])
  const pendingTotal = useMemo(() => pending.reduce((sum, r) => sum + (r.amount || 0), 0), [pending])
  const pendingIds = useMemo(() => pending.map((r) => r.id), [pending])

  const handleMarkPaid = () => {
    if (pendingIds.length === 0) {
      toast({ title: t('payrollManagement.noPendingToPay'), variant: 'info' })
      return
    }
    onMarkPaid(pendingIds)
    toast({
      title: t('common.success'),
      description: t('payrollManagement.weeklyPaidToast', { count: pendingIds.length }),
      variant: 'success',
    })
  }

  const handleTriggerQuickBooks = () => {
    if (!canTriggerQuickBooks || !onTriggerQuickBooks) return
    if (pendingIds.length === 0) {
      toast({ title: t('payrollManagement.noPendingToPay'), variant: 'info' })
      return
    }
    onTriggerQuickBooks(pendingIds)
    toast({
      title: t('payrollManagement.qbActionQueued'),
      description: t('payrollManagement.qbWeeklyExportQueued', { count: pendingIds.length }),
      variant: 'info',
    })
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg bg-primary/10')}>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('payrollManagement.weeklyPayrollRun')}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('payrollManagement.weeklyPayrollHelp')}
          </p>
        </div>

        <div className="shrink-0">
          <DatePicker
            label={t('payrollManagement.weekSelect')}
            value={weekDate}
            onChange={setWeekDate}
            className="[&_button]:rounded-lg [&_button]:bg-muted/50 [&_button]:border-gray-200/80 [&_button]:h-10 [&_button]:font-normal"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Calendar className="h-4 w-4" />
            {t('payrollManagement.weekRange')}
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {weekStart.toLocaleDateString()} — {weekEnd.toLocaleDateString()}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-muted/20 p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('payrollManagement.pendingEmployees')}
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {pending.length}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-muted/20 p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('payrollManagement.pendingTotal')}
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(pendingTotal)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          className="bg-primary hover:bg-primary/90 text-white rounded-lg"
          onClick={handleMarkPaid}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {t('payrollManagement.markAllPaid')}
        </Button>

        <Button
          variant="outline"
          className="rounded-lg border-gray-200"
          disabled={!canTriggerQuickBooks}
          onClick={handleTriggerQuickBooks}
        >
          {t('payrollManagement.sendToQuickBooks')}
        </Button>
      </div>
    </div>
  )
}

