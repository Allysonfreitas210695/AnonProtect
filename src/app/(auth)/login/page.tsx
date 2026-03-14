'use client'

import { useLogin } from '@/_hooks/public/use-login'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/_components/shared/logo'
import Link from 'next/link'

export default function LoginPage() {
  const { form, onSubmit, isExecuting } = useLogin()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size={60} showText={false} className="rounded-2xl bg-primary/10 p-4 shadow-inner" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Área Administrativa</CardTitle>
            <CardDescription className="mt-2 text-base">
              Identifique-se para acessar o painel de gestão
            </CardDescription>
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
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" disabled={isExecuting}>
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>

          <div className="bg-muted mt-6 rounded-lg p-4 text-sm">
            <p className="mb-2 font-semibold">Credenciais de teste:</p>
            <p>Admin: admin@sistema.com / admin123</p>
            <p>Supervisor: supervisor@sistema.com / super123</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <Link 
              href="/forgot-password" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Esqueceu sua senha?
            </Link>
            <div className="text-muted-foreground">
              Ainda não tem conta?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Cadastre-se
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
