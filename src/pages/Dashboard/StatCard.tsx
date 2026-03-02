import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatPercentage } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'

export interface StatCardProps {
    title: string
    value: string | number
    change: number
    icon: React.ElementType
    description: string
    index: number
}

export function StatCard({ title, value, change, icon: Icon, description, index }: StatCardProps) {
    const isPositive = change >= 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className="overflow-hidden shadow-md hover:shadow-[#CEF8DA]">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-base font-bold text-accent">
                        {title}
                    </CardTitle>

                </CardHeader>
                <CardContent>
                    <div className="text-2xl xl:text-3xl font-bold text-accent">{value}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={cn(
                                'flex items-center text-xs font-medium',
                                isPositive ? 'text-accent' : 'text-accent'
                            )}
                        >
                            {isPositive ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(change)}
                        </span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
