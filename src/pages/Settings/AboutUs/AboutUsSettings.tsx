import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'

const defaultAboutUs = `<h1>About Us</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Who We Are</h2>
<p>Welcome to our platform. We are dedicated to delivering exceptional services and building lasting relationships with our customers and partners.</p>

<h2>2. Our Mission</h2>
<p>Our mission is to simplify operations and empower businesses through innovative solutions. We strive to:</p>
<ul>
  <li>Provide reliable and user-friendly tools</li>
  <li>Support our customers in achieving their goals</li>
  <li>Foster a culture of transparency and trust</li>
  <li>Continuously improve our products and services</li>
</ul>

<h2>3. Our Values</h2>
<p>At our core, we believe in:</p>
<ul>
  <li><strong>Integrity:</strong> Honest and ethical in everything we do</li>
  <li><strong>Innovation:</strong> Constantly evolving to meet your needs</li>
  <li><strong>Excellence:</strong> Delivering the highest quality in every interaction</li>
  <li><strong>Collaboration:</strong> Working together to achieve shared success</li>
</ul>

<h2>4. Our Story</h2>
<p>Founded with a vision to make a difference, we have grown from a small startup to a trusted partner for businesses. Our journey has been shaped by the feedback and trust of our customers.</p>

<h2>5. Our Team</h2>
<p>Our diverse team brings together expertise from various industries. We are passionate about what we do and committed to helping you succeed.</p>

<h2>6. Contact Us</h2>
<p>We would love to hear from you. Whether you have questions, feedback, or need support, our team is here to help.</p>

<hr>
<p><em>If you have any questions about us, please contact us at <a href="mailto:info@example.com">info@example.com</a></em></p>`

export default function AboutUsSettings() {
  const { t } = useTranslation()
  const [aboutUs, setAboutUs] = useState(defaultAboutUs)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const handleSave = async () => {
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: t('settings.aboutUsPage.updated'),
      description: t('settings.aboutUsPage.updatedDesc'),
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
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t('settings.aboutUsPage.title')}</CardTitle>
                <CardDescription>{t('settings.aboutUsPage.description')}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={isSubmitting} className="bg-primary text-white hover:bg-primary/80">
                <Save className="h-4 w-4 mr-2" />
                {t('settings.aboutUsPage.saveChanges')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="gap-2">
                <Info className="h-4 w-4" />
                {t('settings.aboutUsPage.edit')}
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                {t('settings.aboutUsPage.preview')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <TiptapEditor
                content={aboutUs}
                onChange={setAboutUs}
                placeholder={t('settings.aboutUsPage.placeholder')}
                className="min-h-[500px]"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: aboutUs }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
