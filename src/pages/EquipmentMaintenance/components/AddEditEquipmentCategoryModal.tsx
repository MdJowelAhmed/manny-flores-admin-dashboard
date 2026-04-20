import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import {
  addEquipmentCategory,
  updateEquipmentCategory,
} from '@/redux/slices/equipmentCategorySlice'
import type { EquipmentCategory } from '@/types'
import { toast } from '@/utils/toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

interface AddEditEquipmentCategoryModalProps {
  open: boolean
  onClose: () => void
  editingId: string | null
  category: EquipmentCategory | null
}

export function AddEditEquipmentCategoryModal({
  open,
  onClose,
  editingId,
  category,
}: AddEditEquipmentCategoryModalProps) {
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
    const payload: EquipmentCategory = {
      id: isEdit && category ? category.id : `ec-${Date.now()}`,
      name: data.name.trim(),
      createdAt: isEdit && category ? category.createdAt : ts,
      updatedAt: ts,
    }

    if (isEdit) {
      dispatch(updateEquipmentCategory(payload))
      toast({
        title: 'Updated',
        description: 'Equipment category updated successfully.',
        variant: 'success',
      })
    } else {
      dispatch(addEquipmentCategory(payload))
      toast({
        title: 'Added',
        description: 'Equipment category added successfully.',
        variant: 'success',
      })
    }
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Equipment Category' : 'Add Equipment Category'}
      size="md"
      className="bg-white"
      footer={
        <div className="flex justify-end">
          <Button
            type="submit"
            form="equipment-category-form"
            className="min-w-[100px] bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
            disabled={isSubmitting}
          >
            {isEdit ? 'Save' : 'Add Category'}
          </Button>
        </div>
      }
    >
      <form
        id="equipment-category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormInput
          label="Category Name"
          placeholder="e.g. Heavy Machinery"
          error={errors.name?.message}
          required
          {...register('name')}
        />
      </form>
    </ModalWrapper>
  )
}

