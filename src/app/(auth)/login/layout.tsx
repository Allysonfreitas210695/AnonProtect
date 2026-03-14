import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { Home } from 'lucide-react'
import { Logo } from '@/_components/shared/logo'
import { ThemeToggle } from '@/_components/shared/theme-toggle'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size={36} />
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Início
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Área Administrativa</Link>
                </Button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-background/80 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <h3 className="mb-2 font-semibold">Sobre</h3>
              <p className="text-sm text-muted-foreground">
                Canal seguro e anônimo para denúncias de irregularidades.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Privacidade</h3>
              <p className="text-sm text-muted-foreground">
                Suas informações são protegidas e seu anonimato é garantido.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Suporte</h3>
              <p className="text-sm text-muted-foreground">
                Em caso de dúvidas, consulte nossa equipe administrativa.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Sistema de Denúncias Anônimas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
