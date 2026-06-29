import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types'
import { toast } from '@/utils/toast'
import { useTranslation } from 'react-i18next'
import {
  useAddEmployeeManageMutation,
  useUpdateEmployeeManageMutation,
} from '@/redux/slices/super-admin/employeeManagement'
import { BUILDER_ROLE } from '../builderManagementData'

export function AddEditBuilderModal({
  open,
  onClose,
  builder,
  onSave,
  refetch,
}: {
  open: boolean
  onClose: () => void
  builder: Employee | null
  onSave: () => void
  refetch: () => void
}) {
  const { t } = useTranslation()
  const isEdit = !!builder

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')

  const [addEmployeeManage, { isLoading }] = useAddEmployeeManageMutation()
  const [updateEmployeeManage, { isLoading: isUpdateLoading }] =
    useUpdateEmployeeManageMutation()

  useEffect(() => {
    if (open) {
      if (builder) {
        setFullName(builder.fullName || '')
        setEmail(builder.email || '')
        setContact(builder.contact || '')
        setPassword('')
      } else {
        setFullName('')
        setEmail('')
        setContact('')
        setPassword('')
      }
    }
  }, [builder, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!isEdit) {
        if (!password.trim()) {
          toast({
            title: t('common.error'),
            description: t('builderManagement.passwordRequired'),
            variant: 'destructive',
          })
          return
        }

        await addEmployeeManage({
          name: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          confirmPassword: password.trim(),
          contact: contact.trim(),
          role: BUILDER_ROLE,
        }).unwrap()

        toast({
          title: t('common.success'),
          description: t('builderManagement.builderAdded'),
          variant: 'success',
        })
        refetch()
      } else {
        const payload: {
          name: string
          contact: string
          role: string
          password?: string
          confirmPassword?: string
        } = {
          name: fullName.trim(),
          contact: contact.trim(),
          role: BUILDER_ROLE,
        }

        if (password.trim()) {
          payload.password = password.trim()
          payload.confirmPassword = password.trim()
        }

        await updateEmployeeManage({
          id: builder!.id,
          data: payload,
        }).unwrap()

        toast({
          title: t('common.success'),
          description: t('builderManagement.builderUpdated'),
          variant: 'success',
        })
        refetch()
      }

      onSave()
      onClose()
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.data?.message || t('common.somethingWentWrong'),
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('builderManagement.editBuilder') : t('builderManagement.addBuilder')}
      size="lg"
      className="max-w-xl bg-white rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label={t('builderManagement.fullName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <FormInput
          label={t('common.email')}
          type="email"
          value={email}
          disabled={isEdit}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
        />

        <FormInput
          label={t('builderManagement.contact')}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />

        <FormInput
          label={isEdit ? t('builderManagement.newPasswordOptional') : t('builderManagement.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
        />

        <Button
          type="submit"
          disabled={isLoading || isUpdateLoading}
          className="w-full bg-primary text-white"
        >
          {isLoading || isUpdateLoading
            ? t('common.processing')
            : isEdit
              ? t('builderManagement.updateBuilder')
              : t('builderManagement.addBuilder')}
        </Button>
      </form>
    </ModalWrapper>
  )
}
