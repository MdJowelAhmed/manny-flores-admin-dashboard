import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ModalWrapper, FormInput } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from '@/redux/api/categoryApi'
import type { MaterialCategory } from '@/types'
import { toast } from '@/utils/toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

const MATERIAL_CATEGORY_TYPE = 'MATERIAL' as const

interface AddEditMaterialCategoryModalProps {
  open: boolean
  onClose: () => void
  editingId: string | null
  category: MaterialCategory | null
}

export function AddEditMaterialCategoryModal({
  open,
  onClose,
  editingId,
  category,
}: AddEditMaterialCategoryModalProps) {
  const { t } = useTranslation()
  const isEdit = !!editingId
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && category) {
      reset({ name: category.name })
    } else {
      reset({ name: '' })
    }
  }, [open, isEdit, category, reset])

  const onSubmit = async (data: FormData) => {
    const name = data.name.trim()
    const body = { name, type: MATERIAL_CATEGORY_TYPE }

    try {
      if (isEdit && category) {
        await updateCategory({ id: category.id, ...body }).unwrap()
        toast({
          title: t('manageMaterials.categoryUpdated'),
          description: t('manageMaterials.categoryUpdatedDesc'),
          variant: 'success',
        })
      } else {
        await addCategory(body).unwrap()
        toast({
          title: t('manageMaterials.categoryCreated'),
          description: t('manageMaterials.categoryCreatedDesc'),
          variant: 'success',
        })
      }
      onClose()
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof err.data.message === 'string'
          ? err.data.message
          : t('common.error')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  const isLoading = isAdding || isUpdating || isSubmitting

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('manageMaterials.editCategory') : t('manageMaterials.addCategory')}
      size="md"
      className="bg-white"
      footer={
        <div className="flex justify-end">
          <Button
            type="submit"
            form="material-category-form"
            className="min-w-[100px] bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isEdit ? t('common.save') : t('manageMaterials.addCategory')}
          </Button>
        </div>
      }
    >
      <form id="material-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t('manageMaterials.categoryName')}
          placeholder={t('manageMaterials.categoryNamePlaceholder')}
          error={errors.name?.message}
          required
          {...register('name')}
        />
      </form>
    </ModalWrapper>
  )
}
