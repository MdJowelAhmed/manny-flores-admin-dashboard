import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
import { buildProfileFormData, useGetMyProfileQuery, useUpdateMyProfileMutation } from '@/redux/api/authApi'
import { getImageUrl } from '@/utils/getImageUrl'
import { getApiErrorMessage } from '@/utils/apiError'



const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  contact: z.string().min(10, 'Please enter a valid contact number'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Employee'

// function getProfileImageUrl(profile?: string): string {
//   if (!profile) return DEFAULT_AVATAR
//   if (profile.startsWith('http') || profile.startsWith('data:')) return profile

//   const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
//   return `${base}${profile.startsWith('/') ? profile : `/${profile}`}`
// }

function getInitials(name?: string): string {
  if (!name?.trim()) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function profileToFormValues(profile: any): ProfileFormData {
  return {
    name: profile.name ?? '',
    email: profile.email ?? '',
    contact: profile.contact ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
  }
}

export default function ProfileSettings() {
  const { t } = useTranslation()
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR)
  console.log(avatarPreview)
  const profileFileRef = useRef<File | null>(null)

  const { data: profileResponse, isLoading: isProfileLoading } = useGetMyProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation()

  const profile = profileResponse?.data
console.log(profile)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      address: '',
      city: '',
      country: '',
    },
  })

  useEffect(() => {
    if (!profile) return
// console.log(profile.profile)
    reset(profileToFormValues(profile))
    setAvatarPreview(getImageUrl(profile?.profile ?? ''))
    profileFileRef.current = null
  }, [profile, reset])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    profileFileRef.current = file
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    } 
    reader.readAsDataURL(file)
  }

  const handleCancel = () => {
    if (!profile) return
    reset(profileToFormValues(profile))
    setAvatarPreview(getImageUrl(profile.profile ?? ''))
    profileFileRef.current = null
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formData = buildProfileFormData(data, profileFileRef.current)
      const response = await updateProfile(formData).unwrap()

      reset(profileToFormValues(response.data))
      setAvatarPreview(getImageUrl(response.data.profile ?? ''))
      profileFileRef.current = null

      toast({
        title: response.message || t('settings.profileUpdated'),
        description: t('settings.profileUpdatedDesc'),
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, t('settings.profileUpdateFailed')),
        variant: 'destructive',
      })
    }
  }

  if (isProfileLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-96 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
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
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
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

            <div className="space-y-4">
              <h3 className="font-semibold">{t('settings.personalInformation')}</h3>
              <FormInput
                label={t('settings.name')}
                placeholder={t('settings.enterName')}
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label={t('settings.email')}
                  type="email"
                  placeholder={t('settings.enterEmail')}
                  error={errors.email?.message}
                  disabled
                  {...register('email')}
                />
                <FormInput
                  label={t('settings.phone')}
                  placeholder={t('settings.phonePlaceholder')}
                  error={errors.contact?.message}
                  required
                  {...register('contact')}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">{t('settings.addressSection')}</h3>
              <FormInput
                label={t('settings.streetAddress')}
                placeholder={t('settings.streetAddress')}
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
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isUpdating}>
                {t('settings.cancel')}
              </Button>
              <Button type="submit" isLoading={isUpdating} disabled={!profile}>
                {t('settings.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
