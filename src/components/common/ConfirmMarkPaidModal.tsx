import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { BadgeDollarSign } from 'lucide-react'
import { PiUserCircleCheck } from 'react-icons/pi'

interface ConfirmMarkPaidModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
    employeeName?: string
    amount?: number
    month?: string
    year?: number
}

export function ConfirmMarkPaidModal({
    open,
    onClose,
    onConfirm,
    isLoading,
    employeeName,
    amount,
    month,
    year,
}: ConfirmMarkPaidModalProps) {
    return (
        <ModalWrapper
            open={open}
            onClose={onClose}
            title=""
            size="sm"
            className="max-w-sm bg-white"
        >
            <div className="flex flex-col items-center text-center px-2 pt-2 pb-4 gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <BadgeDollarSign className="w-6 h-6 text-emerald-600" />
                </div>

                {/* Heading */}
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-gray-900">Confirm payment</h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to mark this payroll as paid?
                    </p>
                </div>

                {/* Detail card */}
                {(employeeName || amount) && (
                    <div className="w-full rounded-lg border border-gray-100 bg-gray-50 divide-y divide-gray-100 text-sm">
                        {employeeName && (
                            <div className="flex justify-between px-4 py-2.5">
                                <span className="text-gray-500">Employee</span>
                                <span className="font-medium text-gray-800">{employeeName}</span>
                            </div>
                        )}
                        {amount !== undefined && (
                            <div className="flex justify-between px-4 py-2.5">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-medium text-gray-800">
                                    {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </span>
                            </div>
                        )}
                        {(month || year) && (
                            <div className="flex justify-between px-4 py-2.5">
                                <span className="text-gray-500">Period</span>
                                <span className="font-medium text-gray-800">
                                    {[month, year].filter(Boolean).join(' ')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 w-full pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-9 text-sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 h-9 text-sm gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        <PiUserCircleCheck className="w-4 h-4" />
                        {isLoading ? 'Marking...' : 'Yes, mark as paid'}
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    )
}