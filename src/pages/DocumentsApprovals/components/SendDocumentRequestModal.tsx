import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { sonnerToast, toast } from '@/utils/toast'
import { useRequestDocumentMutation } from '@/redux/slices/super-admin/documentsApprovalApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'



export function SendDocumentRequestModal({ open, onClose, projectLoading, projectFetching, projectRefetch, projectPage, setProjectPage, projects, setProjects, getProjectsApi }: any) {
  const { t } = useTranslation()
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [description, setDescription] = useState('')


  const [requestDocument] = useRequestDocumentMutation()

  // Accumulate pages — data is directly getProjectsApi?.data (flat array)
  useEffect(() => {
    const incoming = getProjectsApi?.data
    if (!Array.isArray(incoming)) return
    setProjects((prev: any) => (projectPage === 1 ? incoming : [...prev, ...incoming]))
  }, [open])

  // On modal open: reset state and force a fresh fetch
  useEffect(() => {
    if (!open) return
    setSelectedProjectId('')
    setDescription('')
    setProjectPage(1)
    setProjects([])
    // RTK Query may return stale cache without firing useEffect above,
    // so explicitly refetch to guarantee fresh data
    projectRefetch()
  }, [open])

  const pagination = getProjectsApi?.pagination
  const hasMore = pagination ? projectPage < pagination.totalPage : false

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const nearBottom = scrollHeight - scrollTop <= clientHeight + 20
    if (nearBottom && !projectFetching && hasMore) {
      setProjectPage((p: any) => p + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId || !description.trim()) {
      toast({
        title: t('common.error'),
        description: t('documentsApprovals.requestRequired'),
        variant: 'destructive',
      })
      return
    }

    const data = {
      projectId: selectedProjectId,
      description: description
    }

    try {
      sonnerToast.promise(requestDocument(data).unwrap(), {
        loading: t('common.loading'),
        success: () => {
          onClose()
          return t('documentsApprovals.requestSent')
        },
        error: t('common.error'),
      })

    } catch {
      // handled by toast.promise
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('documentsApprovals.sendDocumentRequest')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="send-document-request-form"
            className="rounded-lg bg-primary hover:bg-primary/90 text-white"
          >
            {t('common.submit')}
          </Button>
        </div>
      }
    >
      <form id="send-document-request-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Project select */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            {t('documentsApprovals.project')}
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={projectLoading}
          >
            <SelectTrigger className="rounded-lg h-11 bg-muted/20 border-gray-200/80">
              {projectLoading ? (
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </span>
              ) : (
                <SelectValue placeholder={t('documentsApprovals.selectProjectPlaceholder')} />
              )}
            </SelectTrigger>

            <SelectContent>
              <div
                className="max-h-52 overflow-y-auto"
                onScroll={handleDropdownScroll}
              >
                {getProjectsApi?.data?.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.estimates?.projectName ?? project.id}
                  </SelectItem>
                ))}

                {/* Loading next page spinner */}
                {projectFetching && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* All loaded */}
                {!hasMore && !projectFetching && projects.length > 0 && (
                  <p className="text-xs text-center text-muted-foreground py-2">
                    {t('common.allLoaded')}
                  </p>
                )}

                {/* Empty state */}
                {!projectLoading && !projectFetching && projects.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-3">
                    {t('common.noData')}
                  </p>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            {t('documentsApprovals.description')}
          </label>
          <FormInput
            placeholder={t('documentsApprovals.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="rounded-lg bg-muted/20 border-gray-200/80 h-24"
          />
        </div>

      </form>
    </ModalWrapper>
  )
}