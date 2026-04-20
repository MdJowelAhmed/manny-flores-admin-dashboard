import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ModalWrapper, FormInput } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addMaterialCategory, updateMaterialCategory } from '@/redux/slices/materialCategorySlice'
import type { MaterialCategory } from '@/types'
import { toast } from '@/utils/toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

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
  const dispatch = useAppDispatch()
  const isEdit = !!editingId

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

  const onSubmit = (data: FormData) => {
    const ts = new Date().toISOString()
    const payload: MaterialCategory = {
      id: isEdit && category ? category.id : `mc-${Date.now()}`,
      name: data.name.trim(),
      createdAt: isEdit && category ? category.createdAt : ts,
      updatedAt: ts,
    }
    if (isEdit) {
      dispatch(updateMaterialCategory(payload))
      toast({
        title: t('manageMaterials.categoryUpdated'),
        description: t('manageMaterials.categoryUpdatedDesc'),
        variant: 'success',
      })
    } else {
      dispatch(addMaterialCategory(payload))
      toast({
        title: t('manageMaterials.categoryCreated'),
        description: t('manageMaterials.categoryCreatedDesc'),
        variant: 'success',
      })
    }
    onClose()
  }

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
            disabled={isSubmitting}
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
