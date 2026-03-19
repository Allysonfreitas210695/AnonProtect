import { toast } from 'sonner'
import { getAddressByCep } from '@/_shared/utils/viacep'
import { UseFormReturn } from 'react-hook-form'
import { ReportInput } from '@/_schemas/report'

export function useCepLookup(form: UseFormReturn<ReportInput>) {
  async function handleCepLookup(cep: string) {
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
        console.error('ViaCEP error:', error)
      }
    }
  }

  return { handleCepLookup }
}
