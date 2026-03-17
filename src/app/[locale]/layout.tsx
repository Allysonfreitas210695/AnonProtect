import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { cn } from '@/_lib/utils'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/_components/shared/theme-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n/request'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'AnonProtect - Sistema de Denúncia Anônima',
  description: 'Canal seguro e anônimo para denúncias de irregularidades.',
  icons: {
    icon: '/favicon.png',
  },
}

import { PageTransition } from '@/_components/shared/page-transition'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen w-full overflow-x-hidden font-sans antialiased',
          inter.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-right" richColors />
            <main className="relative w-full overflow-x-hidden">
              <PageTransition>{children}</PageTransition>
            </main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
