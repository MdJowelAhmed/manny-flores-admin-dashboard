import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

const rentStatusData = [
    { name: 'Running', value: 45, color: '#06B6D4' },
    { name: 'Completed', value: 30, color: '#10B981' },
    { name: 'Upcoming', value: 25, color: '#3B82F6' }
]

export function RentStatusChart() {
    return (
        <div className="">
            <Card>
                <CardHeader>
                    <div className="flex items- justify-between">
                        <CardTitle>Orders By Category</CardTitle>
                        <Select defaultValue="week">
                            <SelectTrigger className="w-[120px] bg-secondary-foreground text-accent border-none">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[245px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={rentStatusData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ cx, cy, midAngle, outerRadius, value, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        
                                        if (midAngle === undefined) {
                                            return null;
                                        }

                                        // Line coordinates - starts from border
                                        const x1 = cx + (outerRadius) * Math.cos(-midAngle * RADIAN);
                                        const y1 = cy + (outerRadius) * Math.sin(-midAngle * RADIAN);

                                        // Straight line going out 16px
                                        const x2 = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
                                        const y2 = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

                                        // Determine if label should go left or right
                                        // index 1 is Completed (green) - goes left
                                        // index 0 is Running (cyan) - goes right
                                        // index 2 is Upcoming (blue) - goes right
                                        const goLeft = index === 1;
                                        const horizontalDistance = 35;

                                        // Horizontal line 20px left or right
                                        const x3 = x2 + (goLeft ? -horizontalDistance : horizontalDistance);
                                        const y3 = y2;

                                        // Label position
                                        const labelX = x3 + (goLeft ? -25 : 25);
                                        const labelY = y3;

                                        return (
                                            <g>
                                                {/* Straight line from border outward 16px */}
                                                <line
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke="#E5E7EB"
                                                    strokeWidth={2}
                                                />
                                                {/* Horizontal line 20px */}
                                                <line
                                                    x1={x2}
                                                    y1={y2}
                                                    x2={x3}
                                                    y2={y3}
                                                    stroke="#E5E7EB"
                                                    strokeWidth={2}
                                                />
                                                {/* Label box */}
                                                <rect
                                                    x={labelX - 25}
                                                    y={labelY - 12}
                                                    width={50}
                                                    height={24}
                                                    fill="white"
                                                    rx={4}
                                                />
                                                <text
                                                    x={labelX}
                                                    y={labelY}
                                                    fill="#1F2937"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-sm font-semibold border-none"
                                                >
                                                    {value}%
                                                </text>
                                            </g>
                                        );
                                    }}
                                >
                                    {rentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white border rounded-lg shadow-lg px-3 py-2">
                                                    <p className="font-semibold text-sm">
                                                        {payload[0].name}: {payload[0].value}%
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
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-3 rounded-sm bg-[#06B6D4]"></div>
                            <span className="text-sm text-muted-foreground">Running</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-3 rounded-sm bg-[#10B981]"></div>
                            <span className="text-sm text-muted-foreground">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-3 rounded-sm bg-[#3B82F6]"></div>
                            <span className="text-sm text-muted-foreground">Upcoming</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}