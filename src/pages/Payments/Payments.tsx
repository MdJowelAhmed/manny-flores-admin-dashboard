import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import { toast } from '@/utils/toast'

import {
  mockPayments,
  type PaymentRecord,
} from './paymentsData'

import { PaymentStatsCards } from './components/PaymentStatsCards'
import { PaymentsTableSection } from './components/PaymentsTableSection'

function getOutstanding(r: PaymentRecord) {
  return Math.max(0, r.totalAmount - r.paidAmount)
}

export default function Payments() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const { user } = useAppSelector((state) => state.auth)
  const userRole = (user?.role as UserRole) ?? UserRole.SUPER_ADMIN
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN

  const [records, setRecords] = useState<PaymentRecord[]>(mockPayments)
  const [query] = useState('')

  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
  const [proofModalOpen, setProofModalOpen] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmMeta, setConfirmMeta] = useState<{
    type: 'markPaid' | 'recordCashReceived'
    recordId: string
  } | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) => {
      return (
        r.paymentId.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q)
      )
    })
  }, [records, query])

  const totals = useMemo(() => {
    const totalCollected = filtered.reduce((sum, r) => sum + r.paidAmount, 0)
    const totalOutstanding = filtered.reduce((sum, r) => sum + getOutstanding(r), 0)
    const pendingApprovals = filtered.filter((r) => r.method === 'cash' && r.cashReceivedRecorded && !r.cashFinalApproved).length
    const totalProjects = new Set(filtered.map((r) => r.projectName)).size
    return { totalCollected, totalOutstanding, pendingApprovals, totalProjects }
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  useEffect(() => {
    if (!proofFile) {
      setProofPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(proofFile)
    setProofPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [proofFile])

  const openProofModal = (r: PaymentRecord) => {
    setSelectedRecord(r)
    setProofFile(null)
    setProofModalOpen(true)
  }

  const requestConfirm = (type: 'markPaid' | 'recordCashReceived', recordId: string) => {
    setConfirmMeta({ type, recordId })
    setConfirmOpen(true)
  }

  const applyMarkPaid = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r
        const nextPaid = r.totalAmount
        return {
          ...r,
          paidAmount: nextPaid,
          status: 'paid',
          cashFinalApproved: r.method === 'cash' ? true : r.cashFinalApproved,
        }
      })
    )
    toast({
      variant: 'success',
      title: t('payments.toast.paidTitle'),
      description: t('payments.toast.paidDesc'),
    })
  }

  const applyRecordCashReceived = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, cashReceivedRecorded: true } : r))
    )
    toast({
      variant: 'success',
      title: t('payments.toast.receivedTitle'),
      description: t('payments.toast.receivedDesc'),
    })
  }

  const handleConfirm = async () => {
    if (!confirmMeta) return
    setConfirmLoading(true)
    try {
      await new Promise((res) => setTimeout(res, 250))
      if (confirmMeta.type === 'markPaid') {
        applyMarkPaid(confirmMeta.recordId)
      } else {
        applyRecordCashReceived(confirmMeta.recordId)
      }
      setConfirmOpen(false)
      setConfirmMeta(null)
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleSaveProof = () => {
    if (!selectedRecord) return
    if (!proofFile || !proofPreviewUrl) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('payments.proof.selectImageError'),
      })
      return
    }
    setRecords((prev) =>
      prev.map((r) => (r.id === selectedRecord.id ? { ...r, proofImageUrl: proofPreviewUrl } : r))
    )
    toast({
      variant: 'success',
      title: t('payments.proof.uploadedTitle'),
      description: t('payments.proof.uploadedDesc'),
    })
    setProofModalOpen(false)
    setSelectedRecord(null)
    setProofFile(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats */}
      <PaymentStatsCards
        totalCollected={totals.totalCollected}
        totalOutstanding={totals.totalOutstanding}
        pendingApprovals={totals.pendingApprovals}
        totalProjects={totals.totalProjects}
      />

   

      {/* Table */}
      <PaymentsTableSection
        paginatedRecords={paginatedRecords}
        isSuperAdmin={isSuperAdmin}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
        onUploadProof={openProofModal}
        onRecordCashReceived={(recordId) => requestConfirm('recordCashReceived', recordId)}
        onMarkPaid={(recordId) => requestConfirm('markPaid', recordId)}
      />

      {/* Proof modal */}
      <ModalWrapper
        open={proofModalOpen}
        onClose={() => {
          setProofModalOpen(false)
          setSelectedRecord(null)
          setProofFile(null)
        }}
        title={t('payments.proof.title')}
        description={selectedRecord ? `${selectedRecord.paymentId} • ${selectedRecord.projectName}` : undefined}
        size="lg"
        className="max-w-xl bg-white"
        footer={
          <div className="flex items-center justify-end gap-2">
          
            <Button onClick={handleSaveProof} className="bg-primary hover:bg-primary/90 text-white">
              {t('payments.proof.save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedRecord?.proofImageUrl && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-sm font-medium text-accent">{t('payments.proof.current')}</div>
              <img
                src={selectedRecord.proofImageUrl}
                alt="check proof"
                className="mt-3 w-full max-h-[320px] object-contain rounded-md bg-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('payments.proof.uploadLabel')}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">{t('payments.proof.hint')}</p>
          </div>

          {proofPreviewUrl && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="text-sm font-medium text-accent">{t('payments.proof.preview')}</div>
              <img
                src={proofPreviewUrl}
                alt="preview"
                className="mt-3 w-full max-h-[320px] object-contain rounded-md bg-white"
              />
            </div>
          )}
        </div>
      </ModalWrapper>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setConfirmMeta(null)
        }}
        onConfirm={async () => {
          if (!confirmMeta) return

          const record = records.find((r) => r.id === confirmMeta.recordId)
          if (!record) return

          if (confirmMeta.type === 'markPaid') {
            const canMarkPaid =
              record.status !== 'paid' &&
              (record.method === 'cash'
                ? isSuperAdmin && Boolean(record.cashReceivedRecorded)
                : record.method === 'check'
                  ? Boolean(record.proofImageUrl)
                  : true)

            if (!canMarkPaid) {
              toast({
                variant: 'destructive',
                title: t('common.error'),
                description:
                  record.method === 'check' && !record.proofImageUrl
                    ? t('payments.rules.checkNeedsProof')
                    : record.method === 'cash' && !isSuperAdmin
                      ? t('payments.rules.cashMannyOnly')
                      : t('payments.rules.notAllowed'),
              })
              return
            }
          }

          await handleConfirm()
        }}
        title={
          confirmMeta?.type === 'recordCashReceived'
            ? t('payments.confirm.recordReceivedTitle')
            : t('payments.confirm.markPaidTitle')
        }
        description={
          confirmMeta?.type === 'recordCashReceived'
            ? t('payments.confirm.recordReceivedDesc')
            : t('payments.confirm.markPaidDesc')
        }
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant="info"
        isLoading={confirmLoading}
      />
    </motion.div>
  )
}

