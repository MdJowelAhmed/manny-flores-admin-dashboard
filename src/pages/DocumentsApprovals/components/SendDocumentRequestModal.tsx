import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ModalWrapper } from '@/components/common'

import { InfiniteScrollSelect } from '@/components/common/InfiniteScrollSelect'

import { FormInput } from '@/components/common/Form'

import { Button } from '@/components/ui/button'

import { sonnerToast, toast } from '@/utils/toast'

import { useRequestDocumentMutation } from '@/redux/slices/super-admin/documentsApprovalApi'



interface SendDocumentRequestModalProps {

  open: boolean

  onClose: () => void

  projectLoading: boolean

  projectFetching: boolean

  projectRefetch: () => void

  projectPage: number

  setProjectPage: React.Dispatch<React.SetStateAction<number>>

  projects: any[]

  setProjects: React.Dispatch<React.SetStateAction<any[]>>

  getProjectsApi: any

}



export function SendDocumentRequestModal({

  open,

  onClose,

  projectLoading,

  projectFetching,

  projectRefetch,

  projectPage,

  setProjectPage,

  projects,

  setProjects,

  getProjectsApi,

}: SendDocumentRequestModalProps) {

  const { t } = useTranslation()

  const [selectedProjectId, setSelectedProjectId] = useState('')

  const [description, setDescription] = useState('')

  const [projectSearch, setProjectSearch] = useState('')



  const [requestDocument] = useRequestDocumentMutation()



  useEffect(() => {

    const incoming = getProjectsApi?.data

    if (!Array.isArray(incoming)) return

    setProjects((prev) => (projectPage === 1 ? incoming : [...prev, ...incoming]))

  }, [getProjectsApi?.data, projectPage, setProjects])



  useEffect(() => {

    if (!open) return



    setSelectedProjectId('')

    setDescription('')

    setProjectSearch('')

    setProjectPage(1)



    const incoming = getProjectsApi?.data

    if (Array.isArray(incoming)) {

      setProjects(incoming)

    } else {

      setProjects([])

    }



    projectRefetch()

  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps



  const pagination = getProjectsApi?.pagination

  const hasMore = pagination ? projectPage < pagination.totalPage : false



  const projectOptions = useMemo(() => {

    const query = projectSearch.trim().toLowerCase()

    return projects

      .filter((project) => {

        if (!query) return true

        const name = project?.projectName?.toLowerCase() ?? ''

        return name.includes(query) || String(project.id).toLowerCase().includes(query)

      })

      .map((project) => ({

        value: project?.estimateId,

        label: project?.projectName ?? project.estimate?.projectName,

      }))

  }, [projects, projectSearch])



  const handleProjectSearch = useCallback((search: string) => {

    setProjectSearch(search)

  }, [])



  const handleProjectLoadMore = useCallback(() => {

    if (!projectFetching && hasMore) {

      setProjectPage((p) => p + 1)

    }

  }, [projectFetching, hasMore, setProjectPage])



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

      description,

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

        <InfiniteScrollSelect

          label={t('documentsApprovals.project')}

          value={selectedProjectId}

          onChange={setSelectedProjectId}

          placeholder={t('documentsApprovals.selectProjectPlaceholder')}

          options={projectOptions}

          loading={projectLoading || projectFetching}

          hasMore={hasMore}

          onSearch={handleProjectSearch}

          onLoadMore={handleProjectLoadMore}

        />



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

