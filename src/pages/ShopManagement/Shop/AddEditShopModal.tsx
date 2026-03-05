import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormTextarea, FormSelect, ImageUploader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addShop, updateShop } from '@/redux/slices/shopSlice'
import type { Shop } from '@/types'
import { toast } from '@/utils/toast'

const OFF_DAY_OPTIONS = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
]

const schema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  contact: z.string().min(1, 'Contact is required'),
  location: z.string().min(1, 'Location is required'),
  openTime: z.string().min(1, 'Open time is required'),
  closeTime: z.string().min(1, 'Close time is required'),
  offDay: z.string().optional(),
  aboutShop: z.string().min(1, 'About shop is required'),
})

type FormData = z.infer<typeof schema>

interface AddEditShopModalProps {
  open: boolean
  onClose: () => void
  editingId: string | null
  shop: Shop | null
}

export function AddEditShopModal({
  open,
  onClose,
  editingId,
  shop,
}: AddEditShopModalProps) {
  const dispatch = useAppDispatch()
  const isEdit = !!editingId
  const [image, setImage] = useState<File | string | null>(null)

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopName: '',
      contact: '',
      location: '',
      openTime: '09:00',
      closeTime: '18:00',
      offDay: '',
      aboutShop: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && shop) {
        reset({
          shopName: shop.shopName,
          contact: shop.contact,
          location: shop.location,
          openTime: shop.openTime,
          closeTime: shop.closeTime,
          offDay: shop.offDay || '',
          aboutShop: shop.aboutShop,
        })
        setImage(shop.shopPicture || null)
      } else {
        reset({
          shopName: '',
          contact: '',
          location: '',
          openTime: '09:00',
          closeTime: '18:00',
          offDay: '',
          aboutShop: '',
        })
        setImage(null)
      }
    }
  }, [open, isEdit, shop, reset])

  const onSubmit = (data: FormData) => {
    const now = new Date().toISOString()
    const picture =
      typeof image === 'string' ? image : image ? URL.createObjectURL(image) : undefined

    const payload: Shop = {
      id: isEdit && shop ? shop.id : Date.now().toString(),
      shopName: data.shopName,
      contact: data.contact,
      location: data.location,
      openTime: data.openTime,
      closeTime: data.closeTime,
      offDay: data.offDay || undefined,
      aboutShop: data.aboutShop,
      shopPicture: picture,
      isActive: isEdit && shop ? shop.isActive : true,
      createdAt: isEdit && shop ? shop.createdAt : now,
      updatedAt: now,
    }
    if (isEdit) {
      dispatch(updateShop(payload))
      toast({ title: 'Updated', description: 'Shop updated successfully.' })
    } else {
      dispatch(addShop(payload))
      toast({ title: 'Added', description: 'Shop added successfully.' })
    }
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Shop' : 'New Shop'}
      size="xl"
      className="bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Shop Name"
            placeholder="Enter shop name"
            error={errors.shopName?.message}
            required
            {...register('shopName')}
          />
          <FormInput
            label="Contact"
            placeholder="e.g. +1664456285966"
            error={errors.contact?.message}
            required
            {...register('contact')}
          />
        </div>

        <FormInput
          label="Location"
          placeholder="e.g. 17 Motijheel C/A, Dhaka 1000"
          error={errors.location?.message}
          required
          {...register('location')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Open Time"
            type="time"
            error={errors.openTime?.message}
            required
            {...register('openTime')}
          />
          <FormInput
            label="Close Time"
            type="time"
            error={errors.closeTime?.message}
            required
            {...register('closeTime')}
          />
        </div>

        <Controller
          name="offDay"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Off Day"
              value={field.value || ''}
              options={OFF_DAY_OPTIONS}
              onChange={field.onChange}
              placeholder="Select off day (optional)"
            />
          )}
        />

        <FormTextarea
          label="About Shop"
          placeholder="Describe your shop..."
          error={errors.aboutShop?.message}
          required
          rows={4}
          {...register('aboutShop')}
        />

        <div>
          <label className="text-sm font-medium mb-2 block">Shop Picture</label>
          <ImageUploader
            value={image}
            onChange={(f) => setImage(f)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {/* <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button> */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Saving...' : 'Add New Shop'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
