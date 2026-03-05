import { Wallet, Gift, CreditCard, Check, RotateCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { Transaction } from '@/types'
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters'

interface RevenueTableProps {
  transactions: Transaction[]
}

function PaymentMethodIcon({ method }: { method: string }) {
  const methodLower = method.toLowerCase()
  if (methodLower.includes('wallet') || methodLower.includes('coffecito')) {
    return <Wallet className="h-4 w-4 text-muted-foreground" />
  }
  if (methodLower.includes('gift')) {
    return <Gift className="h-4 w-4 text-muted-foreground" />
  }
  return <CreditCard className="h-4 w-4 text-muted-foreground" />
}

export function RevenueTable({ transactions }: RevenueTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-[#f5f0e8] text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold">
              Date & Time
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold">Amount</th>
            <th className="px-6 py-4 text-left text-sm font-bold">
              Payment Method
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold">status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No revenue records found
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* ID Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-800">
                    {transaction.transactionId}
                  </span>
                </td>

                {/* Date & Time Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-slate-700">
                      {formatDate(transaction.createdAt, 'dd MMM yyyy')}
                    </span>
                    <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {formatTime(transaction.createdAt)}
                    </span>
                  </div>
                </td>

                {/* Amount Column */}
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-slate-800">
                    {formatCurrency(
                      transaction.amount,
                      transaction.currency || 'EUR'
                    )}
                  </span>
                </td>

                {/* Payment Method Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <PaymentMethodIcon method={transaction.paymentMethod || ''} />
                    <span className="text-sm text-slate-700">
                      {transaction.paymentMethod || 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-3 rounded-sm w-28 text-xs font-medium text-white',
                      transaction.status === 'Completed'
                        ? 'bg-green-600'
                        : transaction.status === 'Pending'
                          ? 'bg-red-500'
                          : transaction.status === 'Failed'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                    )}
                  >
                    {transaction.status === 'Completed' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <RotateCw className="h-4 w-4" />
                    )}
                    {transaction.status}
                  </span>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
