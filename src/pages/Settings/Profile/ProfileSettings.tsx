import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { FormInput } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: 'Jowel',
      lastName: 'Ahmed',
      email: 'mdjowelahmed924@gmail.com',
      phone: '+1234567890',
      address: '123 Main Street',
      city: 'Dhaka',
      country: 'Bangladesh',
      // bio: 'Dashboard administrator with full access to all features.',
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    console.log('Profile data:', data)
    
    toast({
      title: t('settings.profileUpdated'),
      description: t('settings.profileUpdatedDesc'),
    })
    
    setIsSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profileInformation')}</CardTitle>
          <CardDescription>
            {t('settings.updateProfileDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold">{t('settings.profilePicture')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('settings.imageHint')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">{t('settings.personalInformation')}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label={t('settings.firstName')}
                  placeholder={t('settings.firstNamePlaceholder')}
                  error={errors.firstName?.message}
                  required
                  {...register('firstName')}
                />
                <FormInput
                  label={t('settings.lastName')}
                  placeholder={t('settings.lastNamePlaceholder')}
                  error={errors.lastName?.message}
                  required
                  {...register('lastName')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label={t('settings.email')}
                  type="email"
                  placeholder={t('settings.emailPlaceholder')}
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                <FormInput
                  label={t('settings.phone')}
                  placeholder={t('settings.phonePlaceholder')}
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">{t('settings.addressSection')}</h3>
              <FormInput
                label={t('settings.streetAddress')}
                placeholder={t('settings.streetAddressPlaceholder')}
                error={errors.address?.message}
                {...register('address')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label={t('settings.city')}
                  placeholder={t('settings.cityPlaceholder')}
                  error={errors.city?.message}
                  {...register('city')}
                />
                <FormInput
                  label={t('settings.country')}
                  placeholder={t('settings.countryPlaceholder')}
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
            </div>

            <Separator />

        

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                {t('settings.cancel')}
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {t('settings.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}












