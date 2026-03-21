'use client'

import { ShieldCheck, CheckCircle2, Lock, EyeOff, Activity, Globe, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/_components/ui/card'
import { useTranslations } from 'next-intl'

export function ComplianceGuard() {
  const t = useTranslations('Dashboard.compliance')

  const lgpdMeasures = [
    {
      id: 'encryption',
      title: t('measures.encryption.title'),
      status: t('active'),
      icon: <Lock className="h-4 w-4 text-emerald-500" />,
      description: t('measures.encryption.desc'),
    },
    {
      id: 'redaction',
      title: t('measures.redaction.title'),
      status: t('active'),
      icon: <EyeOff className="h-4 w-4 text-emerald-500" />,
      description: t('measures.redaction.desc'),
    },
    {
      id: 'audit',
      title: t('measures.audit.title'),
      status: t('active'),
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      description: t('measures.audit.desc'),
    },
  ]

  const gdprMeasures = [
    {
      id: 'anonymization',
      title: t('measures.anonymization.title'),
      status: t('active'),
      icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
      description: t('measures.anonymization.desc'),
    },
    {
      id: 'integrity',
      title: t('measures.integrity.title'),
      status: t('verified'),
      icon: <ShieldCheck className="h-4 w-4 text-blue-500" />,
      description: t('measures.integrity.desc'),
    },
    {
      id: 'retention',
      title: t('measures.retention.title'),
      status: t('active'),
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      description: t('measures.retention.desc'),
    },
  ]

  return (
    <Card className="from-card/50 to-muted/20 relative overflow-hidden border-none bg-linear-to-br shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
      <div className="bg-primary/5 absolute top-0 right-0 p-8">
        <Globe className="translate-y--12 h-24 w-24 translate-x-12 opacity-10" />
      </div>

      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 ring-primary/20 flex h-10 w-10 items-center justify-center rounded-xl ring-1">
            <ShieldCheck className="text-primary h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black">{t('title')}</CardTitle>
            <CardDescription className="font-bold"> {t('description')} </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LGPD Section */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-widest uppercase opacity-70">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('lgpd')}
            </h3>
            <div className="grid gap-3">
              {lgpdMeasures.map((measure) => (
                <div
                  key={measure.id}
                  className="bg-muted/30 group hover:bg-muted/50 relative rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{measure.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{measure.title}</span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          {measure.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{measure.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GDPR Section */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-widest uppercase opacity-70">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {t('gdpr')}
            </h3>
            <div className="grid gap-3">
              {gdprMeasures.map((measure) => (
                <div
                  key={measure.id}
                  className="bg-muted/30 group hover:bg-muted/50 relative rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{measure.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{measure.title}</span>
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                          {measure.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{measure.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
