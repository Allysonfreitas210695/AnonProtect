'use client'

import { useTranslations } from 'next-intl'
import { Category } from '@/_generated/prisma'
import { useNewReport } from '@/_hooks/public/use-new-report'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { MapPin } from 'lucide-react'
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
import { Checkbox } from '@/_components/ui/checkbox'
import { Turnstile } from '@marsidev/react-turnstile'
import { WhistleblowerAssistant } from './whistleblower-assistant'
import { formatCEP } from '@/_shared/utils/formatters'

export default function NewReportForm({ categories }: { categories: Category[] }) {
  const t = useTranslations('NewReport')
  const { theme } = useTheme()
  const [files, setFiles] = useState<File[]>([])
  const { form, onSubmit, isExecuting, isUploading, isSubmitting, handleCepLookup } = useNewReport()

  const selectedCountry = form.watch('country')
  const isBrazil = selectedCountry === 'Brasil' || selectedCountry === 'Brazil'
  const postalCode = form.watch('postalCode')

  useEffect(() => {
    if (isBrazil && postalCode?.replace(/\D/g, '').length === 8) {
      const formatted = formatCEP(postalCode)
      if (formatted !== postalCode) {
        form.setValue('postalCode', formatted)
      }
      handleCepLookup(postalCode)
    }
  }, [postalCode, isBrazil, handleCepLookup, form])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:py-12">
      <div className="mb-8 text-center">
        <h1 className="from-primary to-primary/70 mb-2 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">{t('description')}</p>
      </div>

      <Card className="shadow-xl">
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

              <div className="bg-muted/20 ring-border/50 space-y-4 rounded-xl pt-4 pb-4 ring-1">
                <div className="flex items-center gap-2 px-4">
                  <MapPin className="text-primary h-4 w-4" />
                  <span className="text-sm font-bold tracking-wider uppercase opacity-70">
                    {t('location')}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="px-4">
                        <FormLabel>{t('country')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={t('selectCountry') || 'Selecione o país'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Brasil">Brasil</SelectItem>
                            <SelectItem value="Outro">Outro / International</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="px-4">
                        <FormLabel>
                          {isBrazil ? t('postalCode') : t('postalCodeInternational')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value
                              if (isBrazil) {
                                field.onChange(formatCEP(val))
                              } else {
                                field.onChange(val)
                              }
                            }}
                            placeholder={
                              isBrazil
                                ? t('postalCodePlaceholder')
                                : t('postalCodePlaceholderInternational')
                            }
                            className="h-11"
                            maxLength={isBrazil ? 9 : 20}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 px-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>
                          {t('city')}{' '}
                          <span className="text-xs font-normal opacity-70">{t('optional')}</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" readOnly={isBrazil && !!field.value} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('state')}{' '}
                          <span className="text-xs font-normal opacity-70">{t('optional')}</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" readOnly={isBrazil && !!field.value} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('district')}{' '}
                          <span className="text-xs font-normal opacity-70">{t('optional')}</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" readOnly={isBrazil && !!field.value} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-border/50 h-px opacity-50 transition-opacity" />

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
                  className="h-11 max-w-full overflow-hidden"
                />
                <p className="text-muted-foreground text-[10px] lg:text-xs">{t('uploadHint')}</p>
              </div>

              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="flex w-full justify-center overflow-x-auto py-2">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => form.setValue('turnstileToken', token || '')}
                    options={{ theme: theme === 'dark' ? 'dark' : 'light' }}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="bg-muted/10 ring-border/50 flex flex-row items-start space-y-0 space-x-3 rounded-xl p-4 ring-1">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('acceptTerms')}</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  loading={isExecuting}
                  className="h-12 w-full text-lg shadow-sm sm:w-auto sm:min-w-[200px]"
                >
                  {isUploading ? t('uploading') : isSubmitting ? t('analyzing') : t('submit')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <WhistleblowerAssistant />
    </div>
  )
}
