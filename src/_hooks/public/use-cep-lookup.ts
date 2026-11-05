import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { getAddressByCep } from '@/_shared/utils/viacep'
import { clientLogger } from '@/_shared/lib/client-logger'
import { UseFormReturn } from 'react-hook-form'
import { ReportInput } from '@/_schemas/report'

type CepFilledFields = { city: boolean; state: boolean; district: boolean }

const NONE_FILLED: CepFilledFields = { city: false, state: false, district: false }

export function useCepLookup(form: UseFormReturn<ReportInput>) {
  // Trava só os campos que o ViaCEP realmente preencheu; o resto continua editável
  const [cepFilled, setCepFilled] = useState<CepFilledFields>(NONE_FILLED)

  const handleCepLookup = useCallback(
    async (cep: string) => {
      const cleanCep = cep.replace(/\D/g, '')
      setCepFilled(NONE_FILLED)
      if (cleanCep.length === 8) {
        try {
          const address = await getAddressByCep(cleanCep)
          if (address) {
            form.setValue('city', address.localidade)
            form.setValue('state', address.uf)
            form.setValue('district', address.bairro)
            form.clearErrors(['city', 'state', 'district'])
            setCepFilled({
              city: !!address.localidade,
              state: !!address.uf,
              district: !!address.bairro,
            })
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

  return { handleCepLookup, cepFilled }
}
