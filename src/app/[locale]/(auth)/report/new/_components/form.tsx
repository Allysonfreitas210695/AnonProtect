'use client'

import { useTranslations } from 'next-intl'
import { Category } from '@/_generated/prisma'
import { useNewReport } from '@/_hooks/public/use-new-report'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { Textarea } from '@/_components/ui/textarea'
import { Input } from '@/_components/ui/input'
import { Button } from '@/_components/ui/button'
import { Turnstile } from '@marsidev/react-turnstile'

export default function NewReportForm({ categories }: { categories: Category[] }) {
  const t = useTranslations('NewReport')
  const { theme } = useTheme()
  const [files, setFiles] = useState<File[]>([])
  const { form, onSubmit, isExecuting } = useNewReport()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      <div className="mb-8 text-center">
        <h1 className="from-primary to-primary/70 mb-2 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">{t('description')}</p>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">{t('occurrenceDetails')}</CardTitle>
          <CardDescription>{t('confidentialityNotice')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit(files)
              }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('occurrenceType')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t('selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="none" disabled>
                            {t('noCategories')}
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('detailedDescription')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('descriptionPlaceholder')}
                        className="min-h-[150px] resize-none lg:min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">{t('descriptionHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('evidenceOptional')}</label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="h-11"
                />
                <p className="text-muted-foreground text-[10px] lg:text-xs">
                  {t('uploadHint') ||
                    'Envie fotos, documentos ou vídeos que ajudem na investigação.'}
                </p>
              </div>

              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="space-y-4">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => form.setValue('turnstileToken', token || '')}
                    options={{ theme: theme === 'dark' ? 'dark' : 'light' }}
                  />
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  loading={isExecuting}
                  className="h-12 w-full text-lg shadow-sm sm:w-auto sm:min-w-[200px]"
                >
                  {t(isExecuting ? 'submitting' : 'submit')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
