import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sonnerToast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useChangePasswordMutation } from '@/redux/api/authApi'

// ── Schema — field names match backend payload ──────────────────────────────
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[a-z]/, 'One lowercase letter')
      .regex(/[0-9]/, 'One number')
      .regex(/[^A-Za-z0-9]/, 'One special character'),
    confirmNewPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

// ── Reusable password input ─────────────────────────────────────────────────
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

// forwardRef is REQUIRED — without it, register()'s ref never reaches the
// underlying <input>, so react-hook-form can't read the value and watch()
// always returns '', making pills never go green and validation always fail.
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, ...props }, ref) => {
    const [show, setShow] = useState(false)
    return (
      <div className="space-y-1.5">
        <Label className={cn('text-sm font-medium', error && 'text-destructive')}>
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            type={show ? 'text' : 'password'}
            className={cn(
              'pr-10 h-10 bg-white transition-colors',
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error      && <p className="text-xs text-destructive">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

// ── Requirement pill ────────────────────────────────────────────────────────
// function Requirement({ label, met }: { label: string; met: boolean }) {
//   return (
//     <div
//       className={cn(
//         'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-all duration-200',
//         met
//           ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//           : 'border-gray-100 bg-gray-50 text-muted-foreground'
//       )}
//     >
//       <span
//         className={cn(
//           'flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 transition-colors',
//           met ? 'bg-emerald-500' : 'bg-gray-200'
//         )}
//       >
//         {met
//           ? <Check className="w-2 h-2 text-white" strokeWidth={3} />
//           : <X className="w-2 h-2 text-gray-400" strokeWidth={3} />
//         }
//       </span>
//       {label}
//     </div>
//   )
// }

// ── Strength bar ────────────────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  const levels = [
    { label: '',          color: 'bg-gray-200' },
    { label: 'Very weak', color: 'bg-red-500'    },
    { label: 'Weak',      color: 'bg-orange-400' },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Strong',    color: 'bg-emerald-400' },
    { label: 'Very strong', color: 'bg-emerald-600' },
  ]
  const current = levels[score]

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= score ? current.color : 'bg-gray-100'
            )}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={cn('text-xs font-medium', current.color.replace('bg-', 'text-'))}>
          {current.label}
        </p>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ChangePassword() {
  const { t } = useTranslation()
  const [changePassword, { isLoading }] = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange', // validate on every keystroke so errors clear in real time
  })

  const newPassword = watch('newPassword', '')

  // const requirements = [
  //   { label: t('auth.atLeast8Chars'),    met: newPassword.length >= 8           },
  //   { label: t('auth.oneUppercase'),      met: /[A-Z]/.test(newPassword)         },
  //   { label: t('auth.oneLowercase'),      met: /[a-z]/.test(newPassword)         },
  //   { label: t('auth.oneNumber'),         met: /[0-9]/.test(newPassword)         },
  //   { label: t('auth.oneSpecialChar'),    met: /[^A-Za-z0-9]/.test(newPassword) },
  // ]

  const onSubmit = async (data: PasswordFormData) => {
    sonnerToast.promise(
      changePassword({
        currentPassword:        data.oldPassword,
        newPassword:        data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      }).unwrap(),
      {
        loading: t('settings.updatingPassword'),
        success: () => {
          reset()
          return t('settings.passwordChanged')
        },
        error: (err: any) => err?.data?.message || t('settings.passwordChangeFailed'),
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{t('settings.changePassword')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('settings.changePasswordPage.description')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Current password */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-1 border-b border-gray-50">
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
            {t('settings.currentPassword')}
          </div>
          <PasswordInput
            label={t('settings.currentPassword')}
            placeholder={t('settings.changePasswordPage.currentPasswordPlaceholder')}
            error={errors.oldPassword?.message}
            required
            {...register('oldPassword')}
          />
        </div>

        {/* New password */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-1 border-b border-gray-50">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            {t('settings.changePasswordPage.newPassword')}
          </div>

          <PasswordInput
            label={t('settings.changePasswordPage.newPassword')}
            placeholder={t('settings.changePasswordPage.newPasswordPlaceholder')}
            error={errors.newPassword?.message}
            required
            {...register('newPassword')}
          />

          {/* Strength bar + requirements — slide in once user starts typing */}
          <motion.div
            initial={false}
            animate={newPassword.length > 0 ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <StrengthBar password={newPassword} />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {t('settings.passwordRequirements')}
                </p>
                {/* <div className="grid grid-cols-2 gap-1.5">
                  {requirements.map((r) => (
                    <Requirement key={r.label} label={r.label} met={r.met} />
                  ))}
                </div> */}
              </div>
            </div>
          </motion.div>

          <PasswordInput
            label={t('settings.changePasswordPage.confirmNewPassword')}
            placeholder={t('settings.changePasswordPage.confirmNewPasswordPlaceholder')}
            error={errors.confirmNewPassword?.message}
            required
            {...register('confirmNewPassword')}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-sm"
            onClick={() => reset()}
            disabled={isLoading}
          >
            {t('settings.cancel')}
          </Button>
          <Button
            type="submit"
            className="h-9 px-5 text-sm"
            isLoading={isLoading}
          >
            {!isLoading && <ShieldCheck className="w-4 h-4 mr-1.5" />}
            {t('settings.changePassword')}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}