import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types'
import { roleOptions } from '../employeeManagementData'
import { toast } from '@/utils/toast'
import {
  useAddEmployeeManageMutation,
  useUpdateEmployeeManageMutation,
} from '@/redux/slices/super-admin/employeeManagement'

export function AddEditEmployeeModal({
  open,
  onClose,
  employee,
  onSave,
  refetch
}: {
  open: boolean
  onClose: () => void
  employee: Employee | null
  onSave: () => void
  refetch: () => void
}) {
  const isEdit = !!employee

  // =========================
  // STATES
  // =========================
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')

  const [addEmployeeManage, { isLoading }] =
    useAddEmployeeManageMutation()

  const [updateEmployeeManage, { isLoading: isUpdateLoading }] =
    useUpdateEmployeeManageMutation()

  // =========================
  // PREFILL
  // =========================
  useEffect(() => {
    if (open) {
      if (employee) {
        setFullName(employee.fullName || '')
        setEmail(employee.email || '')
        setContact(employee.contact || '')
        setRole(employee.role || '')
        setPassword('')
      } else {
        setFullName('')
        setEmail('')
        setContact('')
        setRole('')
        setPassword('')
      }
    }
  }, [employee, open])

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // =========================
      // ADD
      // =========================
      if (!isEdit) {
        if (!password.trim()) {
          toast({
            title: 'Error',
            description: 'Password is required',
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
          role,
        }).unwrap()

        toast({
          title: 'Success',
          description: 'Employee added successfully',
          variant: 'success',
        })
        refetch()
      }

      // =========================
      // UPDATE (FIXED)
      // =========================
      else {
        const payload: any = {
          name: fullName.trim(),
          contact: contact.trim(),
          role,
        }

        // only send password if changed
        if (password.trim()) {
          payload.password = password.trim()
          payload.confirmPassword = password.trim()
        }

        await updateEmployeeManage({
          id: employee!.id,
          data: payload,
        }).unwrap()

        toast({
          title: 'Success',
          description: 'Employee updated successfully',
          variant: 'success',
        })
        refetch()
      }

      onSave()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      size="lg"
      className="max-w-xl bg-white rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* NAME */}
        <FormInput
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {/* EMAIL (DISABLED IN EDIT) */}
        <FormInput
          label="Email"
          type="email"
          value={email}
          disabled={isEdit}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
        />

        {/* CONTACT */}
        <FormInput
          label="Contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />

        {/* ROLE */}
        <FormSelect
          label="Role"
          value={role}
          options={roleOptions}
          onChange={setRole}
          placeholder="Select role"
        />

        {/* PASSWORD (OPTIONAL IN EDIT) */}
        <FormInput
          label={isEdit ? 'New Password (optional)' : 'Password'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
        />

        {/* BUTTON */}
        <Button
          type="submit"
          disabled={isLoading || isUpdateLoading}
          className="w-full bg-primary text-white"
        >
          {isLoading || isUpdateLoading
            ? 'Processing...'
            : isEdit
              ? 'Update Employee'
              : 'Add Employee'}
        </Button>
      </form>
    </ModalWrapper>
  )
}