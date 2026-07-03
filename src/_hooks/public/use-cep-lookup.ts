import { useCallback } from 'react'
import { toast } from 'sonner'
import { getAddressByCep } from '@/_shared/utils/viacep'
import { clientLogger } from '@/_shared/lib/client-logger'
import { UseFormReturn } from 'react-hook-form'
import { ReportInput } from '@/_schemas/report'

export function useCepLookup(form: UseFormReturn<ReportInput>) {
  const handleCepLookup = useCallback(
    async (cep: string) => {
      const cleanCep = cep.replace(/\D/g, '')
      if (cleanCep.length === 8) {
        try {
          const address = await getAddressByCep(cleanCep)
          if (address) {
            form.setValue('city', address.localidade)
            form.setValue('state', address.uf)
            form.setValue('district', address.bairro)
            form.clearErrors(['city', 'state', 'district'])
          } else {
            toast.error('CEP não encontrado')
          }
        } catch (error) {
          toast.error('Erro ao buscar CEP')
          clientLogger.error('ViaCEP error:', error)
        }
      }
    },
    [form]
  )

  return { handleCepLookup }
}
