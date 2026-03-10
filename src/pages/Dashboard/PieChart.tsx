import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
const projectStatusData = [
    { name: 'Completed', value: 182, color: '#10B981' },
    { name: 'Pending', value: 65, color: '#F59E0B' },
    { name: 'Scheduled', value: 85, color: '#A855F7' },
    { name: 'In Progress', value: 125, color: '#3B82F6' },
]

export function PieChartComponent() {
    return (
       <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.3, delay: 0.6 }}
    
       >
 <Card className="h-full border-none shadow-sm bg-white ">
            <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold text-gray-800">Project Status</CardTitle>
                <p className="text-sm text-gray-400 mt-1">Current distribution</p>
            </CardHeader>
            <CardContent>
                <div className="h-[240px] w-full flex items-center justify-center mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={projectStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={105}
                                paddingAngle={3}
                                stroke="none"
                                dataKey="value"
                            >
                                {projectStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.1)] px-3 py-2 border border-gray-100">
                                                <p className="font-medium text-sm" style={{ color: payload[0].payload.color }}>
                                                    {payload[0].name}: {payload[0].value}
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 w-fit mx-auto mt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm bg-[#10B981]"></div>
                        <span className="text-sm text-gray-600 font-medium">Completed</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm bg-[#3B82F6]"></div>
                        <span className="text-sm text-gray-600 font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm bg-[#A855F7]"></div>
                        <span className="text-sm text-gray-600 font-medium">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm bg-[#F59E0B]"></div>
                        <span className="text-sm text-gray-600 font-medium">Pending</span>
                    </div>
                </div>
            </CardContent>
        </Card>
        </motion.div>
    )
}
