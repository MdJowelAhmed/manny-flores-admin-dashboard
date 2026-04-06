import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RecentProject } from '../recentProjectsData'
import { useTranslation } from 'react-i18next'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

interface ProjectPlanUploadModalProps {
  open: boolean
  onClose: () => void
  project: RecentProject | null
  onUploadSuccess: (projectId: string, files: File[]) => void
}

export function ProjectPlanUploadModal({
  open,
  onClose,
  project,
  onUploadSuccess,
}: ProjectPlanUploadModalProps) {
  const { t } = useTranslation()
  const [projectInfo, setProjectInfo] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const projectTitle = project?.projectName || project?.project || ''

  useEffect(() => {
    if (open && project) {
      setProjectInfo('')
      setFiles([])
    }
  }, [open, project?.id])

  const onPickFile = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (list?.length) {
      setFiles((prev) => [...prev, ...Array.from(list)])
    }
    e.target.value = ''
  }

  const removeAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!project) return
    if (files.length === 0) {
      toast({
        title: t('common.error'),
        description: t('projectPlanModal.selectFile'),
        variant: 'destructive',
      })
      return
    }
    onUploadSuccess(project.id, files)
    toast({
      title: t('common.success'),
      description: t('projectPlanModal.uploadSuccess'),
    })
    onClose()
  }

  if (!project) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projectPlanModal.title')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-gray-200 text-gray-600"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-[#66BB6A] hover:bg-[#5aad5f] text-white"
            onClick={handleSubmit}
          >
            {t('common.submit')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="plan-project-name">{t('projectPlanModal.projectName')}</Label>
            <Input
              id="plan-project-name"
              readOnly
              value={projectTitle}
              className="bg-gray-50/80 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-project-info">
              {t('projectPlanModal.projectInformation')}
            </Label>
            <Input
              id="plan-project-info"
              value={projectInfo}
              onChange={(e) => setProjectInfo(e.target.value)}
              placeholder={t('projectPlanModal.projectInformationPlaceholder')}
              className="bg-gray-50/80 border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('projectPlanModal.uploadDocument')}</Label>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={onPickFile}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {t('projectPlanModal.uploadLinePrefix')}{' '}
              <span className="font-medium text-[#FFA726]">
                {t('projectPlanModal.fileTypesHighlight')}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {t('projectPlanModal.multipleHint')}
            </span>
          </button>
          {files.length > 0 && (
            <ul className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-medium text-emerald-800">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                    aria-label={t('common.delete')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}
