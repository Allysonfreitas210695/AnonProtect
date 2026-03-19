'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileInput } from '@/_schemas/auth'
import { updateProfileAction } from '@/_actions/admin/profile.action'
import { Button } from '@/_components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import { Input } from '@/_components/ui/input'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'

interface ProfileFormProps {
  initialData: {
    name: string
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations('Profile')
  const commonT = useTranslations('Common')

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
    },
  })

  const { execute, isPending } = useAction(updateProfileAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(t('success'))
      } else if (data?.error) {
        toast.error(data.error)
      }
    },
    onError: () => {
      toast.error(t('error'))
    },
  })

  const onSubmit = (values: ProfileInput) => {
    execute(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? commonT('loading') : t('saveChanges')}
        </Button>
      </form>
    </Form>
  )
}
