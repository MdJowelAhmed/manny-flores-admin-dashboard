import { Card, CardTitle } from '@/components/ui/card'

import { motion } from 'framer-motion'

export interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    description: string
    index: number
}

export function StatCard({ title, value, icon: Icon, index }: StatCardProps) {


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className="overflow-hidden shadow-sm hover:shadow-[#CEF8DA]">
                <div className="flex items-center justify-between px-6 py-8">

                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-base  text-accent">
                            {title}
                        </CardTitle>
                        <div className="text-2xl xl:text-3xl font-bold text-accent">{value}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 ">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                </div>

            </Card>
        </motion.div>
    )
}
