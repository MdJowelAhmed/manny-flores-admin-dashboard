import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export function PieChartComponent({ projectStatusApi }: any) {
    const { t } = useTranslation()

    const statusConfig: Record<string, { name: string; color: string }> = {
        COMPLETED: { name: t('dashboard.completed'), color: '#10B981' },
        COMPLETED_REQUESTED: { name: t('dashboard.completedRequested'), color: '#14B8A6' },
        IN_PROGRESS: { name: t('dashboard.inProgress'), color: '#3B82F6' },
        SCHEDULED: { name: t('dashboard.scheduled'), color: '#A855F7' },
        PENDING: { name: t('dashboard.pending'), color: '#F59E0B' },
        CANCELLED: { name: t('dashboard.cancelled', 'Cancelled'), color: '#EF4444' },
    }

    const apiData = projectStatusApi?.data || []
    const statusOrder = [
        'COMPLETED',
        'COMPLETED_REQUESTED',
        'IN_PROGRESS',
        'SCHEDULED',
        'PENDING',
        'CANCELLED',
    ]

    const projectStatusData = statusOrder.map((status) => {
        const item = apiData.find((d: any) => d.status === status)
        const config = statusConfig[status]
        if (!config) return null
        return {
            name: config.name,
            value: Number(item?.percentage || 0),
            color: config.color,
        }
    }).filter(Boolean) as { name: string; value: number; color: string }[]

    const chartData = projectStatusData.filter(item => item.value > 0)
    const hasData = chartData.length > 0
    const displayChartData = hasData ? chartData : [{ name: t('common.noDataFound', 'No Data'), value: 100, color: '#E5E7EB' }]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
        >
            <Card className="h-full border-none shadow-sm bg-white ">
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-semibold text-gray-800">{t('dashboard.projectStatus')}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">{t('dashboard.currentDistribution')}</p>
                </CardHeader>
                <CardContent>
                    <div className="h-[240px] w-full flex items-center justify-center mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={105}
                                    paddingAngle={hasData ? 3 : 0}
                                    stroke="none"
                                    dataKey="value"
                                >
                                    {displayChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                {hasData && (
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.1)] px-3 py-2 border border-gray-100">
                                                        <p className="font-medium text-sm" style={{ color: payload[0].payload.color }}>
                                                            {payload[0].name}: {payload[0].value}%
                                                        </p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 w-fit mx-auto mt-6">
                        {projectStatusData.map((item, index) => (
                            <div key={`legend-${index}`} className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-gray-600 font-medium">
                                    {item.name} ({item.value}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
