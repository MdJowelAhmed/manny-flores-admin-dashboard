import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'

const defaultPrivacy = `<h1>Privacy Policy</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you:</p>
<ul>
  <li>Create an account</li>
  <li>Make a purchase</li>
  <li>Contact us for support</li>
  <li>Subscribe to our newsletter</li>
  <li>Participate in surveys or promotions</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li><strong>Provide services:</strong> Deliver, maintain, and improve our services</li>
  <li><strong>Process transactions:</strong> Handle payments and send related information</li>
  <li><strong>Communications:</strong> Send technical notices and support messages</li>
  <li><strong>Support:</strong> Respond to your comments and questions</li>
  <li><strong>Analytics:</strong> Monitor and analyze trends, usage, and activities</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We do not share your personal information with third parties except:</p>
<ul>
  <li>With your explicit consent</li>
  <li>For legal compliance reasons</li>
  <li>To protect rights, property, and safety</li>
  <li>With service providers who assist our operations</li>
</ul>

<h2>4. Data Security</h2>
<p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access. This includes:</p>
<ul>
  <li>Encryption of data in transit and at rest</li>
  <li>Regular security assessments</li>
  <li>Access controls and authentication</li>
  <li>Employee training on data protection</li>
</ul>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li><strong>Access:</strong> Request access to your personal data</li>
  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
  <li><strong>Deletion:</strong> Request deletion of your data</li>
  <li><strong>Objection:</strong> Object to processing of your data</li>
  <li><strong>Portability:</strong> Request transfer of your data</li>
</ul>

<h2>6. Cookies</h2>
<p>We use cookies and similar technologies to collect information about your browsing activities. You can control cookies through your browser settings.</p>

<h2>7. Children's Privacy</h2>
<p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

<h2>8. Changes to This Policy</h2>
<p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

<hr>
<p><em>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@example.com">privacy@example.com</a></em></p>`

export default function PrivacySettings() {
  const { t } = useTranslation()
  const [privacy, setPrivacy] = useState(defaultPrivacy)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const handleSave = async () => {
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: t('settings.privacyPage.updated'),
      description: t('settings.privacyPage.updatedDesc'),
    })

    setIsSubmitting(false)
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
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t('settings.privacyPage.title')}</CardTitle>
                <CardDescription>{t('settings.privacyPage.description')}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={isSubmitting} className="bg-primary text-white hover:bg-primary/80">
                <Save className="h-4 w-4 mr-2" />
                {t('settings.privacyPage.saveChanges')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="gap-2">
                <Shield className="h-4 w-4" />
                {t('settings.privacyPage.edit')}
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                {t('settings.privacyPage.preview')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <TiptapEditor
                content={privacy}
                onChange={setPrivacy}
                placeholder={t('settings.privacyPage.placeholder')}
                className="min-h-[500px]"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: privacy }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
