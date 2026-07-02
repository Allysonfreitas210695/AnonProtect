'use client'

import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { KeyRound, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'
import { resetPasswordAction } from '@/_actions/public/reset-password.action'
import { useRouter, useSearchParams } from 'next/navigation'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const { execute, isExecuting } = useAction(resetPasswordAction, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        toast.error(data.error)
      } else if (data?.success) {
        toast.success('Senha redefinida com sucesso! Você já pode fazer login.')
        router.push('/login')
      }
    },
    onError: () => {
      toast.error('Ocorreu um erro inesperado ao redefinir a senha.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('Token de recuperação inválido ou ausente.')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    execute({ token, password, confirmPassword })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <KeyRound className="text-primary h-16 w-16" />
        </div>
        <div>
          <CardTitle className="text-3xl">Nova Senha</CardTitle>
          <CardDescription className="mt-2 text-base">
            Crie uma nova senha segura para sua conta.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {!token ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-sm dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-300">
              O link de recuperação parece estar quebrado ou incompleto. Solicite um novo link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm leading-none font-medium">Nova Senha</label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="******"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm leading-none font-medium">Confirmar Senha</label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="******"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isExecuting}>
              {isExecuting ? 'Salvando...' : 'Redefinir Senha'}
            </Button>
          </form>
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
  )
}
