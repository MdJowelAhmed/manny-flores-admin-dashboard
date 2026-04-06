import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
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
}

export function ProjectPlanUploadModal({
  open,
  onClose,
  project,
}: ProjectPlanUploadModalProps) {
  const { t } = useTranslation()
  const [projectInfo, setProjectInfo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const projectTitle = project?.projectName || project?.project || ''

  useEffect(() => {
    if (open && project) {
      setProjectInfo('')
      setFile(null)
    }
  }, [open, project?.id])

  const onPickFile = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f ?? null)
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (!project) return
    if (!file) {
      toast({
        title: t('common.error'),
        description: t('projectPlanModal.selectFile'),
        variant: 'destructive',
      })
      return
    }
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
            accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={onPickFile}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-10 text-center transition-colors hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {t('projectPlanModal.uploadLinePrefix')}{' '}
              <span className="font-medium text-[#FFA726]">
                {t('projectPlanModal.fileTypesHighlight')}
              </span>
            </span>
            {file && (
              <span className="text-xs font-medium text-emerald-700">{file.name}</span>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
