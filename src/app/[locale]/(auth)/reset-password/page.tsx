import { Suspense } from 'react'
import { Card } from '@/_components/ui/card'
import { ResetPasswordForm } from './_components/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 text-center">
            <p>Carregando...</p>
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
