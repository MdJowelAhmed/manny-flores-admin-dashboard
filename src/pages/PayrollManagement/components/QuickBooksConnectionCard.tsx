import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Link2, Link2Off, Printer, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'

const LS_CONNECTED = 'qb_connected'
const LS_COMPANY = 'qb_company'

export interface QuickBooksConnectionState {
  connected: boolean
  companyName?: string
}

function readConnection(): QuickBooksConnectionState {
  const connected = localStorage.getItem(LS_CONNECTED) === 'true'
  const companyName = localStorage.getItem(LS_COMPANY) || undefined
  return { connected, companyName }
}

function writeConnection(next: QuickBooksConnectionState) {
  localStorage.setItem(LS_CONNECTED, next.connected ? 'true' : 'false')
  if (next.companyName) localStorage.setItem(LS_COMPANY, next.companyName)
  else localStorage.removeItem(LS_COMPANY)
}

interface QuickBooksConnectionCardProps {
  onConnectionChange?: (s: QuickBooksConnectionState) => void
}

export function QuickBooksConnectionCard({ onConnectionChange }: QuickBooksConnectionCardProps) {
  const { t } = useTranslation()
  const [state, setState] = useState<QuickBooksConnectionState>(() => readConnection())

  useEffect(() => {
    onConnectionChange?.(state)
  }, [state, onConnectionChange])

  const statusPill = useMemo(() => {
    if (!state.connected) {
      return { label: t('payrollManagement.qbNotConnected'), cls: 'bg-muted text-muted-foreground border-gray-200' }
    }
    return { label: t('payrollManagement.qbConnected'), cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }, [state.connected, t])

  const handleConnect = async () => {
    // Demo connect flow. Replace with OAuth redirect when backend is ready.
    await new Promise((r) => setTimeout(r, 350))
    const next: QuickBooksConnectionState = { connected: true, companyName: 'QuickBooks Company' }
    writeConnection(next)
    setState(next)
    toast({ title: t('common.success'), description: t('payrollManagement.qbConnectedToast'), variant: 'success' })
  }

  const handleDisconnect = () => {
    const next: QuickBooksConnectionState = { connected: false }
    writeConnection(next)
    setState(next)
    toast({ title: t('common.success'), description: t('payrollManagement.qbDisconnectedToast'), variant: 'success' })
  }

  const handlePrintChecks = () => {
    toast({ title: t('payrollManagement.qbActionQueued'), description: t('payrollManagement.qbPrintChecksQueued'), variant: 'info' })
  }

  const handleTriggerPayments = () => {
    toast({ title: t('payrollManagement.qbActionQueued'), description: t('payrollManagement.qbTriggerPaymentsQueued'), variant: 'info' })
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{t('payrollManagement.quickBooks')}</h3>
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', statusPill.cls)}>
              {statusPill.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('payrollManagement.qbHelp')}
          </p>
          {state.connected && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('payrollManagement.qbConnectedAs', { company: state.companyName ?? '—' })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!state.connected ? (
            <Button onClick={handleConnect} className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 px-4">
              <Link2 className="h-4 w-4 mr-2" />
              {t('payrollManagement.connectQuickBooks')}
            </Button>
          ) : (
            <Button variant="outline" onClick={handleDisconnect} className="rounded-lg h-10 px-4 border-gray-200">
              <Link2Off className="h-4 w-4 mr-2" />
              {t('payrollManagement.disconnect')}
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-lg h-10 px-3 border-gray-200"
            onClick={() => window.open('https://quickbooks.intuit.com/', '_blank', 'noreferrer')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('payrollManagement.learnMore')}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="rounded-lg border-gray-200"
          disabled={!state.connected}
          onClick={handlePrintChecks}
        >
          <Printer className="h-4 w-4 mr-2" />
          {t('payrollManagement.printChecks')}
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90 text-white rounded-lg"
          disabled={!state.connected}
          onClick={handleTriggerPayments}
        >
          <Send className="h-4 w-4 mr-2" />
          {t('payrollManagement.triggerPayments')}
        </Button>
      </div>
    </div>
  )
}

