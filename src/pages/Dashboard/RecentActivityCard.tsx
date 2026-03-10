import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import { recentProjectsData } from './dashboardData'

export function RecentActivityCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="col-span-1 border-none shadow-sm"
        >
            <Card className="bg-white border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <CardTitle className="text-xl font-bold text-slate-800">Recent Projects</CardTitle>
                    <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                        view all
                    </button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-auto">
                        <table className="w-full min-w-[980px]">
                            <thead>
                                <tr className="bg-gray-50/80 text-slate-800 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-sm font-bold">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Customer Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Project</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Progress</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Value</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-slate-700">
                                {recentProjectsData.map((project, index) => (
                                    <motion.tr
                                        key={`${project.id}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="hover:bg-gray-50/50 shadow"
                                    >
                                        <td className="px-6 py-5 text-sm font-medium">
                                            {project.id}
                                        </td>
                                        <td className="px-6 py-5 text-sm">
                                            {project.customerName}
                                        </td>
                                        <td className="px-6 py-5 text-sm">
                                            {project.project}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                                                    project.status === 'In Progress'
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : 'bg-red-100 text-red-500'
                                                }`}
                                            >
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${project.status === 'In Progress' ? 'bg-green-500' : 'bg-gray-300'}`}
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium">
                                            {project.value}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
