import Link from 'next/link'
import { Logo } from '@/_components/shared/logo'
import { ThemeToggle } from '@/_components/shared/theme-toggle'

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sem link para login */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size={36} />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Sobre</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Canal seguro e anônimo para denúncias de irregularidades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Privacidade</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Suas informações são protegidas e seu anonimato é garantido.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Anonimato</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Não solicitamos identificação. Use apenas o código de rastreamento.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© 2024 Sistema de Denúncias Anônimas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
