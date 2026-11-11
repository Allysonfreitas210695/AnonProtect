import { describe, expect, it } from 'vitest'
import { PII_PLACEHOLDER, redactStructuredPii } from './pii-filter'

const P = PII_PLACEHOLDER

describe('redactStructuredPii', () => {
  it.each([
    ['CPF formatado', 'Meu CPF é 123.456.789-09.', `Meu CPF é ${P}.`, 'CPF'],
    ['CPF sem pontuação', 'cpf 12345678909 do gerente', `cpf ${P} do gerente`, 'CPF'],
    ['CNPJ formatado', 'Empresa 12.345.678/0001-95 lesada', `Empresa ${P} lesada`, 'CNPJ'],
    ['CNPJ sem pontuação', 'cnpj 12345678000195', `cnpj ${P}`, 'CNPJ'],
    ['e-mail', 'Escreva para joao.silva+rh@empresa.com.br hoje', `Escreva para ${P} hoje`, 'EMAIL'],
    ['celular com DDD', 'Ligue (11) 98765-4321', `Ligue ${P}`, 'TELEFONE'],
    ['celular com +55', 'Whats +55 11 98765-4321', `Whats ${P}`, 'TELEFONE'],
    ['fixo sem DDD', 'ramal 3456-7890', `ramal ${P}`, 'TELEFONE'],
    // 11 dígitos soltos são indistinguíveis de CPF: ocultado igual, contado como CPF
    ['celular só dígitos', 'número 11987654321', `número ${P}`, 'CPF'],
    ['celular sem DDD', 'número 98765 4321', `número ${P}`, 'TELEFONE'],
    ['CEP formatado', 'Mora no CEP 01310-100.', `Mora no CEP ${P}.`, 'CEP'],
    ['CEP com ponto', 'endereço 01.310-100', `endereço ${P}`, 'CEP'],
    ['CEP só dígitos após rótulo', 'CEP: 01310100', `CEP: ${P}`, 'CEP'],
  ] as const)('oculta %s', (_label, input, expected, type) => {
    const result = redactStructuredPii(input)
    expect(result.text).toBe(expected)
    expect(result.counts[type]).toBe(1)
  })

  it('oculta vários tipos no mesmo relato e conta cada um', () => {
    const input =
      'O gerente Carlos (CPF 123.456.789-09, carlos@empresa.com, tel. (21) 99876-5432) ' +
      'desviou verba da filial no CEP 20040-020.'
    const { text, counts } = redactStructuredPii(input)

    expect(text).not.toMatch(/\d{3}\.\d{3}/)
    expect(text).not.toContain('@')
    expect(text).not.toContain('99876')
    expect(text).not.toContain('20040')
    // Nomes em texto livre continuam a cargo da IA
    expect(text).toContain('Carlos')
    expect(counts).toEqual({ EMAIL: 1, CNPJ: 0, CPF: 1, CEP: 1, TELEFONE: 1 })
  })

  it('não consome parte de um CNPJ como CPF', () => {
    const { text, counts } = redactStructuredPii('CNPJ 12.345.678/0001-95')
    expect(text).toBe(`CNPJ ${P}`)
    expect(counts.CPF).toBe(0)
  })

  it.each([
    'Aconteceu em 15/03/2024 às 14:30.',
    'O prejuízo foi de R$ 1.500.000,00.',
    'Foram 250 funcionários afetados em 2023.',
    'Código de rastreamento AP-2026-ABCD-EFGH-JKMN-PQRS',
    'Sala 1204, andar 12.',
  ])('preserva texto sem dados estruturados: %s', (input) => {
    const { text, counts } = redactStructuredPii(input)
    expect(text).toBe(input)
    expect(Object.values(counts).every((n) => n === 0)).toBe(true)
  })

  it('é idempotente', () => {
    const once = redactStructuredPii('CPF 123.456.789-09 e (11) 98765-4321').text
    expect(redactStructuredPii(once).text).toBe(once)
  })
})
