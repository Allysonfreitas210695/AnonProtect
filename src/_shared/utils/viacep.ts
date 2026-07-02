import { logger } from '@/_shared/lib/logger'
export interface ViaCEPAddress {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export async function getAddressByCep(cep: string): Promise<ViaCEPAddress | null> {
  const cleanCep = cep.replace(/\D/g, '')

  if (cleanCep.length !== 8) {
    return null
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data: ViaCEPAddress = await response.json()

    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    logger.error(error, 'Error fetching address from ViaCEP:')
    return null
  }
}
