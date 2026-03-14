import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/_lib/utils'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/_components/shared/theme-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Sistema de Denúncia Anônima',
  description: 'Canal seguro e anônimo para denúncias.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('bg-background min-h-screen font-sans antialiased', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" richColors />
          <main className="px-4 py-2">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
