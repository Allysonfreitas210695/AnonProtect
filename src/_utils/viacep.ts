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

/**
 * Busca o endereço completo a partir de um CEP brasileiro usando a API ViaCEP.
 *
 * @param {string} cep - O CEP a ser consultado (apenas números ou formatado).
 * @returns {Promise<ViaCEPAddress | null>} Os dados do endereço ou null se não for encontrado.
 */
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
    console.error('Error fetching address from ViaCEP:', error)
    return null
  }
}
