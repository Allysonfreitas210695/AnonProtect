'use client'

import { useRegister } from '@/_hooks/public/use-register'
import { Button } from '@/_components/ui/button'
import { PasswordInput } from '@/_components/ui/password-input'
import { Input } from '@/_components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const { form, onSubmit, isExecuting } = useRegister()
  const t = useTranslations('Register')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <UserPlus className="text-primary h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-3xl">{t('title')}</CardTitle>
            <CardDescription className="mt-2 text-base">{t('subtitle')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" loading={isExecuting}>
                {isExecuting ? t('submitRegistering') : t('submit')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('alreadyHaveAccount')}
            </Link>
            <div className="mt-6 flex justify-center gap-4 text-xs opacity-50">
              <Link
                href="/privacy-policy"
                className="hover:text-primary underline transition-colors"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-primary underline transition-colors"
              >
                {t('terms')}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
