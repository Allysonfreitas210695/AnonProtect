'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/_components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/_components/ui/dialog'
import { UserMinus } from 'lucide-react'
import { anonymizeUser } from '@/_actions/admin/anonymize-user'
import { toast } from 'sonner'

export function AnonymizeButton() {
  const t = useTranslations('Profile')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAnonymize = async () => {
    try {
      setLoading(true)
      await anonymizeUser()
      toast.success(t('successAnonymized'))
    } catch (error) {
      toast.error(t('error'))
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <UserMinus className="mr-2 h-4 w-4" />
          {t('anonymizeButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <UserMinus className="h-5 w-5" />
            {t('anonymizeTitle')}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed">
            {t('anonymizeDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="bg-destructive/10 border-destructive/20 border-l-4 p-4 text-xs italic">
          {t('rightToBeForgotten')} - Art. 18, IV da LGPD
        </div>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {t('anonymizeCancel')}
          </Button>
          <Button variant="destructive" onClick={handleAnonymize} disabled={loading}>
            {loading ? '...' : t('anonymizeConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
