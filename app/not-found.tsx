import Link from 'next/link'
import { Button } from '@/app/_components/ui/button'
import { Shield, Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl">
            <Shield className="h-12 w-12" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-9xl font-bold text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Página não encontrada
          </h2>
        </div>

        {/* Description */}
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
          A página que você está procurando não existe ou foi movida. Verifique o endereço e tente
          novamente.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-5 w-5" />
              Voltar ao Início
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/report/track">
              <Search className="h-5 w-5" />
              Acompanhar Denúncia
            </Link>
          </Button>
        </div>

        {/* Additional Links */}
        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Você também pode:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/report/new" className="text-blue-600 hover:underline dark:text-blue-400">
              Fazer uma denúncia
            </Link>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Área administrativa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
