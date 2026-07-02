import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { getApiErrorMessage } from '@/utils/apiError'
import { motion } from 'framer-motion'
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  type RuleType,
} from '@/redux/api/settingsApi'

type RuleTranslationKey = 'aboutUsPage' | 'privacyPage' | 'termsPage'

interface RuleSettingsPageProps {
  type: RuleType
  icon: LucideIcon
  translationKey: RuleTranslationKey
  defaultContent: string
}

export default function RuleSettingsPage({
  type,
  icon: Icon,
  translationKey,
  defaultContent,
}: RuleSettingsPageProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState(defaultContent)
  const [activeTab, setActiveTab] = useState('preview')

  const { data, isLoading, isError } = useGetSettingsQuery(type)
  const [updateSettings, { isLoading: isSubmitting }] = useUpdateSettingsMutation()

  useEffect(() => {
    if (data?.data?.content !== undefined) {
      setContent(data.data.content || defaultContent)
    }
  }, [data?.data?.content, defaultContent])

  const handleSave = async () => {
    try {
      await updateSettings({ content, type }).unwrap()
      toast({
        title: t(`settings.${translationKey}.updated`),
        description: t(`settings.${translationKey}.updatedDesc`),
      })
    } catch (err: unknown) {
      toast({
        title: t('common.error'),
        description: getApiErrorMessage(err, t(`settings.${translationKey}.updateFailed`)),
        variant: 'destructive',
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t(`settings.${translationKey}.title`)}</CardTitle>
                <CardDescription>{t(`settings.${translationKey}.description`)}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                isLoading={isSubmitting}
                disabled={isLoading || isError}
                className="bg-primary text-white hover:bg-primary/80"
              >
                <Save className="h-4 w-4 mr-2" />
                {t(`settings.${translationKey}.saveChanges`)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[500px] text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center min-h-[500px] text-destructive">
              {t(`settings.${translationKey}.loadFailed`)}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="edit" className="gap-2">
                  <Icon className="h-4 w-4" />
                  {t(`settings.${translationKey}.edit`)}
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  {t(`settings.${translationKey}.preview`)}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-0">
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder={t(`settings.${translationKey}.placeholder`)}
                  className="min-h-[500px]"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
