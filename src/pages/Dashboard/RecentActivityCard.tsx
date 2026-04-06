import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import type { RecentProject } from '@/pages/RecentProjects/recentProjectsData'
import { useRecentProjects } from '@/contexts/RecentProjectsContext'
import { ProjectViewDetailsModal } from '@/pages/RecentProjects/components/ProjectViewDetailsModal'
import { ProjectPlanUploadModal } from '@/pages/RecentProjects/components/ProjectPlanUploadModal'
import {
    getProjectStatusBadgeStyle,
    getProjectStatusTranslationKey,
} from '@/pages/RecentProjects/projectStatus'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useTranslation } from 'react-i18next'

export function RecentActivityCard() {
    const navigate = useNavigate()
    const { projects, addPlanFiles, removePlanFile, removeProject } =
        useRecentProjects()
    const [showViewModal, setShowViewModal] = useState(false)
    const [showPlanModal, setShowPlanModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProject, setSelectedProject] = useState<RecentProject | null>(
        null
    )
    const { t } = useTranslation()

    const handleViewDetails = (project: RecentProject) => {
        setSelectedProject(project)
        setShowViewModal(true)
    }

    const handleDeleteClick = (project: RecentProject) => {
        setSelectedProject(project)
        setShowDeleteModal(true)
    }

    const handleUploadPlan = (project: RecentProject) => {
        setSelectedProject(project)
        setShowPlanModal(true)
    }

    const handleConfirmDelete = () => {
        if (!selectedProject) return
        removeProject(selectedProject.id)
        setShowDeleteModal(false)
        setSelectedProject(null)
        navigate('/recent-projects')
    }

    const resolvedViewProject: RecentProject | null = selectedProject
        ? projects.find((p) => p.id === selectedProject.id) ?? selectedProject
        : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="col-span-1 border-none shadow-sm"
        >
            <Card className="bg-white border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <CardTitle className="text-xl font-bold text-slate-800">{t('dashboard.recentProjects')}</CardTitle>
                    <Link
                        to="/recent-projects"
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                        {t('dashboard.viewAll')}
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-auto">
                        <table className="w-full min-w-[1180px]">
                            <thead>
                                <tr className="bg-gray-50/80 text-slate-800 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.id')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.customerName')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.project')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.startDate')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.endDate')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.status')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.progress')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.value')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.projectPlan')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">{t('dashboard.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-slate-700">
                                {projects.slice(0, 4).map((project, index) => (
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
                                        <td className="px-6 py-5 text-sm whitespace-nowrap">
                                            {project.startDate}
                                        </td>
                                        <td className="px-6 py-5 text-sm whitespace-nowrap">
                                            {project.endDate}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium"
                                                style={getProjectStatusBadgeStyle(
                                                    project.status
                                                )}
                                            >
                                                {t(getProjectStatusTranslationKey(project.status))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 min-w-[6rem] rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500"
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
                                            <button
                                                type="button"
                                                onClick={() => handleUploadPlan(project)}
                                                className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                                            >
                                                {(project.planFiles?.length ?? 0) > 0
                                                    ? t('dashboard.planUploaded')
                                                    : t('dashboard.uploadPlan')}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewDetails(project)
                                                    }
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    aria-label="View details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteClick(project)
                                                    }
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    aria-label="Delete"
                                                >
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

            <ProjectViewDetailsModal
                open={showViewModal}
                onClose={() => {
                    setShowViewModal(false)
                    setSelectedProject(null)
                }}
                project={resolvedViewProject}
                onRemovePlanFile={
                    resolvedViewProject
                        ? (planFileId) =>
                              removePlanFile(resolvedViewProject.id, planFileId)
                        : undefined
                }
            />

            <ProjectPlanUploadModal
                open={showPlanModal}
                onClose={() => {
                    setShowPlanModal(false)
                    setSelectedProject(null)
                }}
                project={selectedProject}
                onUploadSuccess={(projectId, files) => addPlanFiles(projectId, files)}
            />

            <ConfirmDialog
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedProject(null)
                }}
                onConfirm={handleConfirmDelete}
                title={t('common.areYouSure')}
                description={t('common.deleteConfirmation')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                variant="danger"
            />
        </motion.div>
    )
}
