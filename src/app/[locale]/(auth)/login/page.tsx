'use client'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useLogin } from '@/_hooks/public/use-login'
import { PasswordInput } from '@/_components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import { Logo } from '@/_components/shared/logo'
import { Input } from '@/_components/ui/input'
import { Button } from '@/_components/ui/button'

export default function LoginPage() {
  const t = useTranslations('Login')
  const { form, onSubmit, isExecuting } = useLogin()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="border-border/50 w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo
              size={60}
              showText={false}
              className="bg-primary/10 rounded-2xl p-4 shadow-inner"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">{t('title')}</CardTitle>
            <CardDescription className="mt-2 text-base">{t('description')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@sistema.com" {...field} />
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
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" loading={isExecuting}>
                {t(isExecuting ? 'submitting' : 'submit')}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-2">Ou</span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            size="lg"
            onClick={() => signIn('google')}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            {t('google')}
          </Button>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t('forgotPassword')}
            </Link>
            <div className="text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                {t('registerNow')}
              </Link>
            </div>
            <div className="mt-4 flex gap-4 text-xs opacity-50">
              <Link
                href="/privacy-policy"
                className="hover:text-primary underline transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-primary underline transition-colors"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
