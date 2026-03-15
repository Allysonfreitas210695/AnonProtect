import Link from 'next/link'
import { Logo } from '@/_components/shared/logo'
import { ThemeToggle } from '@/_components/shared/theme-toggle'

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo size={36} />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-background/80 mt-auto border-t py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <h3 className="mb-2 font-semibold">Sobre</h3>
              <p className="text-muted-foreground text-sm">
                Canal seguro e anônimo para denúncias de irregularidades.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Privacidade</h3>
              <p className="text-muted-foreground text-sm">
                Suas informações são protegidas e seu anonimato é garantido.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Anonimato</h3>
              <p className="text-muted-foreground text-sm">
                Não solicitamos identificação. Use apenas o código de rastreamento.
              </p>
            </div>
          </div>
          <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
            <p>
              © {new Date().getFullYear()} Sistema de Denúncias Anônimas. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
