import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import {
  addVehicleCategory,
  updateVehicleCategory,
} from '@/redux/slices/vehicleCategorySlice'
import type { VehicleCategory } from '@/types'
import { toast } from '@/utils/toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

interface AddEditVehicleCategoryModalProps {
  open: boolean
  onClose: () => void
  editingId: string | null
  category: VehicleCategory | null
}

export function AddEditVehicleCategoryModal({
  open,
  onClose,
  editingId,
  category,
}: AddEditVehicleCategoryModalProps) {
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
    const payload: VehicleCategory = {
      id: isEdit && category ? category.id : `vc-${Date.now()}`,
      name: data.name.trim(),
      createdAt: isEdit && category ? category.createdAt : ts,
      updatedAt: ts,
    }

    if (isEdit) {
      dispatch(updateVehicleCategory(payload))
      toast({
        title: 'Updated',
        description: 'Vehicle category updated successfully.',
        variant: 'success',
      })
    } else {
      dispatch(addVehicleCategory(payload))
      toast({
        title: 'Added',
        description: 'Vehicle category added successfully.',
        variant: 'success',
      })
    }
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Vehicle Category' : 'Add Vehicle Category'}
      size="md"
      className="bg-white"
      footer={
        <div className="flex justify-end">
          <Button
            type="submit"
            form="vehicle-category-form"
            className="min-w-[100px] bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
            disabled={isSubmitting}
          >
            {isEdit ? 'Save' : 'Add Category'}
          </Button>
        </div>
      }
    >
      <form
        id="vehicle-category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormInput
          label="Category Name"
          placeholder="e.g. Light Duty"
          error={errors.name?.message}
          required
          {...register('name')}
        />
      </form>
    </ModalWrapper>
  )
}

