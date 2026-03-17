import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/redux/hooks'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const OTP_LENGTH = 6

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { passwordResetEmail, verificationEmail } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  
  const isPasswordReset = location.state?.type === 'reset'
  const email = isPasswordReset ? passwordResetEmail : verificationEmail

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < OTP_LENGTH) newOtp[index] = char
    })
    setOtp(newOtp)

    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')

    if (code.length !== OTP_LENGTH) {
      setError(t('auth.verifyEmail.enterCompleteCode'))
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock verification - accept any 6-digit code
      if (code === '123456' || code.length === 6) {
        if (isPasswordReset) {
          navigate('/auth/reset-password')
        } else {
          navigate('/auth/login', { state: { verified: true } })
        }
      } else {
        setError(t('auth.verifyEmail.invalidCode'))
      }
    } catch {
      setError(t('auth.verifyEmail.errorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendTimer(30)
    // Simulate resending code
    await new Promise((resolve) => setTimeout(resolve, 500))
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

      <Link
        to={isPasswordReset ? '/auth/forgot-password' : '/auth/login'}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('auth.verifyEmail.back')}
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.verifyEmail.verifyYourEmail')}</h1>
        <p className="text-muted-foreground">
          {t('auth.verifyEmail.weSentCode')}
        </p>
        <p className="font-medium">{email || t('auth.verifyEmail.yourEmail')}</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                'w-12 h-14 text-center text-xl font-semibold',
                error && 'border-destructive'
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          {!isLoading && (
            <>
              {t('auth.verifyEmail.verify')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.verifyEmail.didntReceiveCode')}{' '}
          {resendTimer > 0 ? (
            <span className="text-muted-foreground">
              {t('auth.verifyEmail.resendIn', { seconds: resendTimer })}
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
            >
              {t('auth.verifyEmail.clickToResend')}
            </button>
          )}
        </p>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border text-sm text-center">
        <p className="text-muted-foreground">{t('auth.verifyEmail.demoHint')}</p>
        <p className="font-mono font-medium">123456</p>
      </div>
    </div>
  )
}
