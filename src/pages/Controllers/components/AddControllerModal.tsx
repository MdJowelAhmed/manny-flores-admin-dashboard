import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addController } from '@/redux/slices/controllerSlice'
import type { Controller, ControllerRole, Shop } from '@/types'
import { toast } from '@/utils/toast'

const SHOP_NONE = '__none__'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'marketing']),
  shopId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface AddControllerModalProps {
  open: boolean
  onClose: () => void
}

export function AddControllerModal({ open, onClose }: AddControllerModalProps) {
  const dispatch = useAppDispatch()
  const shops: Shop[] = []

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'admin',
      shopId: SHOP_NONE,
    },
  })

  const selectedRole = watch('role')
  const showShopField = selectedRole === 'admin'

  const shopOptions = [
    { value: SHOP_NONE, label: 'Select shop (optional)' },
    ...shops.map((s: Shop) => ({ value: s.id, label: s.shopName })),
  ]

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin',
        shopId: SHOP_NONE,
      })
    }
  }, [open, reset])

  useEffect(() => {
    if (selectedRole !== 'admin') {
      setValue('shopId', SHOP_NONE)
    }
  }, [selectedRole, setValue])

  const onSubmit = (data: FormData) => {
    const now = new Date().toISOString()
    const shopId = data.shopId && data.shopId !== SHOP_NONE ? data.shopId : undefined
    const shop = shopId ? shops.find((s) => s.id === shopId) : undefined
    const payload: Controller = {
      id: `ctrl-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role as ControllerRole,
      shopId,
      shopName: shop?.shopName,
      createdAt: now,
      updatedAt: now,
    }
    dispatch(addController(payload))
    toast({ title: 'Added', description: 'Controller added successfully.' })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Add Controller"
      size="lg"
      className="bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Name"
          placeholder="Enter name"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="Enter email"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <FormInput
          label="Phone"
          placeholder="Enter phone number"
          error={errors.phone?.message}
          required
          {...register('phone')}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Enter password (min 6 characters)"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <FormSelect
          label="Role"
          value={watch('role')}
          onChange={(v) => setValue('role', v as ControllerRole)}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'marketing', label: 'Marketing' },
          ]}
          required
        />

        {showShopField && (
          <FormSelect
            label="Shop (optional)"
            value={watch('shopId') || SHOP_NONE}
            onChange={(v) => setValue('shopId', v)}
            options={shopOptions}
            placeholder="Select shop (optional)"
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          {/* <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button> */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Controller'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
