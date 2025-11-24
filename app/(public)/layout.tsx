import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Shield, Home } from 'lucide-react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Canal de Denúncia</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Anônimo e Seguro</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  Área Administrativa
                </Link>
              </Button>
            </div>
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
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Suporte</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Em caso de dúvidas, consulte nossa equipe administrativa.
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
