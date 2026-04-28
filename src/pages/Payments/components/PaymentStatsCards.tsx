import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'

import { paymentStats } from '../paymentsData'

interface PaymentStatsCardsProps {
  totalCollected: number
  totalOutstanding: number
  pendingApprovals: number
  totalProjects: number
}

export function PaymentStatsCards({
  totalCollected,
  totalOutstanding,
  pendingApprovals,
  totalProjects,
}: PaymentStatsCardsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {paymentStats.map((stat, index) => {
        const Icon = stat.icon
        const value =
          stat.titleKey === 'payments.stats.totalCollected'
            ? totalCollected
            : stat.titleKey === 'payments.stats.totalOutstanding'
              ? totalOutstanding
              : stat.titleKey === 'payments.stats.pendingApprovals'
                ? pendingApprovals
                : totalProjects

        const formatted =
          stat.titleKey === 'payments.stats.totalProjects'
            ? String(value)
            : formatCurrency(value)

        return (
          <motion.div
            key={stat.titleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t(stat.titleKey)}</p>
                <h3 className="text-xl font-bold text-foreground mt-1">{formatted}</h3>
              </div>
              <div className={cn('p-2.5 rounded-lg', stat.iconBg)}>
                <Icon className={cn('h-5 w-5', stat.iconColor)} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

