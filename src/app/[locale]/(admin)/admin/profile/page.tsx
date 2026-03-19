import { getCurrentUser } from '@/_shared/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { ProfileForm } from './_components/profile-form'
import { PasswordForm } from './_components/password-form'
import { prisma } from '@/_shared/lib/prisma'
import { Badge } from '@/_components/ui/badge'
import { KeyRound, ShieldCheck } from 'lucide-react'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  const t = await getTranslations('Profile')

  if (!user?.id) {
    redirect('/login')
  }

  const userAccounts = await prisma.account.findMany({
    where: { userId: user.id },
  })

  const isSocial = userAccounts.length > 0
  const provider = isSocial ? userAccounts[0].provider : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('personalInfo')}</CardTitle>
              <CardDescription>{t('personalInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialData={{ name: user.name || '', email: user.email || '' }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('authInfo')}</CardTitle>
              <CardDescription>{t('authInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 flex items-center justify-between rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    {isSocial ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <KeyRound className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('loginMethod')}</p>
                    <p className="text-muted-foreground text-xs">
                      {isSocial
                        ? t('socialProvider', {
                            provider:
                              provider?.charAt(0).toUpperCase() + (provider?.slice(1) || ''),
                          })
                        : t('credentials')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {isSocial ? provider : 'Credentials'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t('security')}</CardTitle>
            <CardDescription>{t('securityDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
