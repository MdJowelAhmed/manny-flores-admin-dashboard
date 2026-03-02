import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { years } from './dashboardData'

interface ChartDataPoint {
    month: string
    revenue: number
    users: number
    orders: number
}

interface EarningsSummaryChartProps {
    chartData: ChartDataPoint[]
    selectedYear: string
    onYearChange: (year: string) => void
}


const generateTicks = (max: number) => {
    if (max === 0) return [0, 25, 50, 75, 100];

    // Calculate a nice step size
    // We want 5 intervals (0 to max split 4 times) so 5 ticks total including 0
    const roughStep = max / 4;

    // Round step to a "nice" number (like 10, 20, 25, 50, 100 etc)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / magnitude;

    let niceStep;
    if (normalizedStep <= 1) niceStep = 1;
    else if (normalizedStep <= 2) niceStep = 2;
    else if (normalizedStep <= 2.5) niceStep = 2.5;
    else if (normalizedStep <= 5) niceStep = 5;
    else niceStep = 10;

    const step = niceStep * magnitude;

    const ticks = [];
    for (let i = 0; i <= 4; i++) {
        ticks.push(i * step);
    }
    return ticks;
};

const strKFormatter = (num: number) => {
    if (num > 999) {
        return (num / 1000).toFixed(0) + 'k'
    }
    return num.toString()
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#666C79] text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm relative">
                <p>{strKFormatter(payload[0].value)}</p>
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#666C79] rotate-45"></div>
            </div>
        )
    }
    return null
}

export function EarningsSummaryChart({ chartData, selectedYear, onYearChange }: EarningsSummaryChartProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Revenue Overview</CardTitle>
                        <Select value={selectedYear} onValueChange={onYearChange} >
                            <SelectTrigger className="w-[120px] bg-secondary-foreground text-accent border-none">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        Last {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                </CardHeader>
                <CardContent>
                    <div className="h-[290px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F76212" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F76212" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(value) => strKFormatter(value)}
                                    allowDataOverflow={false}
                                    domain={[0, 'dataMax']}
                                    ticks={generateTicks(Math.max(...chartData.map(d => d.revenue)))}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="natural"
                                    dataKey="revenue"
                                    stroke="#F76212"
                                    strokeWidth={3}
                                    fill="url(#earningGradient)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#FF9F43', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
