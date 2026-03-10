import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { years } from './dashboardData'

interface ChartDataPoint {
    month: string
    revenue: number
    expenses: number
}

interface RevenueChartProps {
    chartData: ChartDataPoint[]
    selectedYear: string
    onYearChange: (year: string) => void
}

const strKFormatter = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'k'
    }
    return num.toString()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white text-gray-800 px-3 py-2 rounded text-sm font-medium shadow-md border border-gray-100">
                <p className="mb-1 text-gray-500 font-semibold">{payload[0].payload.month}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                        <p>
                            {entry.name}: <span className="font-bold">{strKFormatter(entry.value)}</span>
                        </p>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderLegend = (props: any) => {
    const { payload } = props;
    return (
        <div className="flex items-center justify-center gap-6 mt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            payload.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-500 font-medium">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export function RevenueChart({ chartData, selectedYear, onYearChange }: RevenueChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="w-full h-full"
        >
            <Card className="h-full border-none shadow-sm  ">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800">Revenue & Expenses</CardTitle>
                        <Select value={selectedYear} onValueChange={onYearChange} >
                            <SelectTrigger className="w-[100px]  bg-primary text-white  border border-gray-200  focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                barGap={4}
                                barSize={12}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => strKFormatter(value)}
                                    allowDataOverflow={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Legend content={renderLegend} verticalAlign="bottom" />
                                <Bar 
                                    dataKey="revenue" 
                                    name="Revenue" 
                                    fill="#00A843" 
                                    radius={[4, 4, 0, 0]} 
                                />
                                <Bar 
                                    dataKey="expenses" 
                                    name="Expenses" 
                                    fill="#FFB800" 
                                    radius={[4, 4, 0, 0]} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
