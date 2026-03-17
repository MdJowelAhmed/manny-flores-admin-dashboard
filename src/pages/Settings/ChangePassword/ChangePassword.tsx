import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'

const createPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().min(1, t('settings.changePasswordPage.currentPasswordRequired')),
      newPassword: z
        .string()
        .min(8, t('settings.changePasswordPage.passwordMinLength'))
        .regex(/[A-Z]/, t('settings.changePasswordPage.mustContainUppercase'))
        .regex(/[a-z]/, t('settings.changePasswordPage.mustContainLowercase'))
        .regex(/[0-9]/, t('settings.changePasswordPage.mustContainNumber'))
        .regex(/[^A-Za-z0-9]/, t('settings.changePasswordPage.mustContainSpecial')),
      confirmPassword: z.string().min(1, t('settings.changePasswordPage.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('settings.changePasswordPage.passwordsDontMatch'),
      path: ['confirmPassword'],
    })

type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>

interface PasswordInputProps {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

function PasswordInput({
  label,
  error,
  helperText,
  required,
  ...props
}: PasswordInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', error && 'border-destructive')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

export default function ChangePassword() {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordSchema = React.useMemo(() => createPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const newPassword = watch('newPassword', '')

  const passwordRequirements = [
    { labelKey: 'settings.changePasswordPage.atLeast8Chars', met: newPassword.length >= 8 },
    { labelKey: 'settings.changePasswordPage.oneUppercase', met: /[A-Z]/.test(newPassword) },
    { labelKey: 'settings.changePasswordPage.oneLowercase', met: /[a-z]/.test(newPassword) },
    { labelKey: 'settings.changePasswordPage.oneNumber', met: /[0-9]/.test(newPassword) },
    { labelKey: 'settings.changePasswordPage.oneSpecialChar', met: /[^A-Za-z0-9]/.test(newPassword) },
  ]

  const onSubmit = async (_data: PasswordFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: t('settings.changePasswordPage.passwordChanged'),
      description: t('settings.changePasswordPage.passwordChangedDesc'),
    })

    reset()
    setIsSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('settings.changePasswordPage.title')}
          </CardTitle>
          <CardDescription>{t('settings.changePasswordPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PasswordInput
              label={t('settings.changePasswordPage.currentPassword')}
              placeholder={t('settings.changePasswordPage.currentPasswordPlaceholder')}
              error={errors.currentPassword?.message}
              required
              {...register('currentPassword')}
            />

            <PasswordInput
              label={t('settings.changePasswordPage.newPassword')}
              placeholder={t('settings.changePasswordPage.newPasswordPlaceholder')}
              error={errors.newPassword?.message}
              required
              {...register('newPassword')}
            />

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">{t('settings.changePasswordPage.passwordRequirements')}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.labelKey}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      req.met ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        req.met ? 'bg-success' : 'bg-muted-foreground'
                      )}
                    />
                    {t(req.labelKey)}
                  </div>
                ))}
              </div>
            </div>

            <PasswordInput
              label={t('settings.changePasswordPage.confirmNewPassword')}
              placeholder={t('settings.changePasswordPage.confirmNewPasswordPlaceholder')}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => reset()}>
                {t('settings.changePasswordPage.cancel')}
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {t('settings.changePasswordPage.changePassword')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}












