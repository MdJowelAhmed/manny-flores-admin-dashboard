import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch } from '@/redux/hooks'
import { setPasswordResetEmail } from '@/redux/slices/authSlice'
import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      dispatch(setPasswordResetEmail(data.email))
      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/auth/verify-email', { state: { type: 'reset' } })
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">D</span>
        </div>
        <span className="font-display font-bold text-2xl">{t('auth.dashboard')}</span>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{t('auth.forgotPassword.title')}</h1>
              <p className="text-muted-foreground">
                {t('auth.forgotPassword.description')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    className={cn('pl-10', errors.email && 'border-destructive')}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {!isLoading && (
                  <>
                    {t('auth.forgotPassword.sendResetLink')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{t('auth.forgotPassword.checkYourEmail')}</h1>
              <p className="text-muted-foreground">
                {t('auth.forgotPassword.weSentCode')}
              </p>
              <p className="font-medium">{submittedEmail}</p>
            </div>

            <Button onClick={handleContinue} className="w-full" size="lg">
              {t('auth.forgotPassword.enterCode')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-sm text-muted-foreground">
              {t('auth.forgotPassword.didntReceiveEmail')}{' '}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary font-medium hover:underline"
              >
                {t('auth.forgotPassword.clickToResend')}
              </button>
            </p>

            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
