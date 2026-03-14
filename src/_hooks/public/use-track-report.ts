"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

export const trackSchema = z.object({
  code: z
    .string()
    .min(8, "O código deve ter pelo menos 8 caracteres")
    .max(12, "Código inválido")
    .regex(/^[A-Z0-9-]+$/, "O código deve conter apenas letras maiúsculas e números"),
})

export type TrackValues = z.infer<typeof trackSchema>

interface UseTrackReportProps {
  initialCode?: string
}

export function useTrackReport({ initialCode }: UseTrackReportProps = {}) {
  const router = useRouter()
  
  const form = useForm<TrackValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      code: initialCode?.toUpperCase() || "",
    },
  })

  const onSubmit = (data: TrackValues) => {
    router.push(`/report/${data.code.toUpperCase()}`)
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  }
}
