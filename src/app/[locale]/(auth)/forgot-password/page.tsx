'use client'

import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { KeyRound, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Informe seu email')
      return
    }
    // Simulação de envio
    setIsSent(true)
    toast.success('Se o email existir, um link de recuperação será enviado.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <KeyRound className="text-primary h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-3xl">Recuperar Senha</CardTitle>
            <CardDescription className="mt-2 text-base">
              {isSent
                ? 'Verifique sua caixa de entrada para redefinir sua senha'
                : 'Informe seu email para receber o link de recuperação'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium">Email</label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Enviar Link
              </Button>
            </form>
          ) : (
            <div className="rounded-lg bg-blue-50 p-4 text-center text-sm dark:bg-blue-900/20">
              <p className="text-blue-700 dark:text-blue-300">
                Email enviado para <strong>{email}</strong>. Não esqueça de verificar a pasta de
                spam.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
