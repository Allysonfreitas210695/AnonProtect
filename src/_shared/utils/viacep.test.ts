import { describe, expect, it, vi } from 'vitest'
import { getAddressByCep } from './viacep'
import { logger } from '@/_shared/lib/logger'

describe('viacep', () => {
  const mockAddress = {
    cep: '01001-000',
    logradouro: 'Praça da Sé',
    complemento: 'lado ímpar',
    bairro: 'Sé',
    localidade: 'São Paulo',
    uf: 'SP',
    ibge: '3550308',
    gia: '1004',
    ddd: '11',
    siafi: '7107',
  }

  it('should return null for invalid CEP length', async () => {
    const result = await getAddressByCep('123')
    expect(result).toBeNull()
  })

  it('should return address for valid CEP', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockAddress),
    })
    global.fetch = fetchMock

    const result = await getAddressByCep('01001000')
    expect(result).toEqual(mockAddress)
    expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/')
  })

  it('should return null if ViaCEP returns error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ erro: true }),
    })
    global.fetch = fetchMock

    const result = await getAddressByCep('99999999')
    expect(result).toBeNull()
  })

  it('should return null and log error on fetch failure', async () => {
    const consoleSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'))
    global.fetch = fetchMock

    const result = await getAddressByCep('01001000')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
