'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updatePasswordSchema, type UpdatePasswordInput } from '@/_schemas/auth'
import { updatePasswordAction } from '@/_actions/admin/profile.action'
import { Button } from '@/_components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import { PasswordInput } from '@/_components/ui/password-input'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'

export function PasswordForm() {
  const t = useTranslations('Profile')
  const commonT = useTranslations('Common')

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { execute, isPending } = useAction(updatePasswordAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(t('passwordSuccess'))
        form.reset()
      } else if (data?.error) {
        toast.error(data.error)
      }
    },
    onError: () => {
      toast.error(t('passwordError'))
    },
  })

  const onSubmit = (values: UpdatePasswordInput) => {
    execute(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('currentPassword')}</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('newPassword')}</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('confirmPassword')}</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? commonT('loading') : t('changePassword')}
        </Button>
      </form>
    </Form>
  )
}
