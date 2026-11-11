/**
 * Pré-filtro determinístico de dados pessoais estruturados.
 *
 * Roda no servidor ANTES de qualquer envio de texto ao provedor de IA, para
 * que identificadores com formato previsível (CPF, CNPJ, e-mail, telefone e
 * CEP) nunca saiam do servidor. Nomes e endereços em texto livre continuam a
 * depender da IA, pois não têm formato fixo.
 */

export const PII_PLACEHOLDER = '[DADO PROTEGIDO]'

export type PiiType = 'EMAIL' | 'CNPJ' | 'CPF' | 'CEP' | 'TELEFONE'

// Impede casar dentro de uma sequência maior de dígitos/letras
// (ex.: não pegar 11 dígitos no meio de um número de 20).
const NOT_AFTER = '(?<![\\w@.\\-/])'
const NOT_BEFORE = '(?![\\w@\\-/]|\\.\\w)'

// A ordem importa: padrões mais longos/específicos primeiro, para que um CNPJ
// não seja parcialmente consumido pelo padrão de CPF, por exemplo.
const PATTERNS: ReadonlyArray<{ type: PiiType; regex: RegExp }> = [
  {
    type: 'EMAIL',
    regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
  },
  {
    // 00.000.000/0000-00 ou 00000000000000
    type: 'CNPJ',
    regex: new RegExp(`${NOT_AFTER}\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2}${NOT_BEFORE}`, 'g'),
  },
  {
    // 000.000.000-00 ou 00000000000
    type: 'CPF',
    regex: new RegExp(`${NOT_AFTER}\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}${NOT_BEFORE}`, 'g'),
  },
  {
    // 00000-000, 00.000-000, ou "CEP 00000000"
    type: 'CEP',
    regex: new RegExp(
      `(?:${NOT_AFTER}\\d{2}\\.?\\d{3}-\\d{3}${NOT_BEFORE})|(?:(?<=\\bCEP:?\\s{0,3})\\d{8}${NOT_BEFORE})`,
      'gi'
    ),
  },
  {
    // +55 (11) 98765-4321, (11) 3456-7890, 11987654321, 98765-4321, 3456 7890
    type: 'TELEFONE',
    regex: new RegExp(
      `(?:(?<![\\w@.\\-/])\\+?55[\\s.-]?)?(?:${NOT_AFTER}\\(?\\d{2}\\)?[\\s.-]?)?${NOT_AFTER}9?\\s?\\d{4}[\\s.-]?\\d{4}${NOT_BEFORE}`,
      'g'
    ),
  },
]

export interface PiiFilterResult {
  /** Texto com os dados estruturados trocados por PII_PLACEHOLDER. */
  text: string
  /** Quantidade de ocorrências substituídas por tipo (sem os valores). */
  counts: Record<PiiType, number>
}

export function redactStructuredPii(input: string): PiiFilterResult {
  const counts: Record<PiiType, number> = { EMAIL: 0, CNPJ: 0, CPF: 0, CEP: 0, TELEFONE: 0 }
  let text = input

  for (const { type, regex } of PATTERNS) {
    text = text.replace(regex, () => {
      counts[type]++
      return PII_PLACEHOLDER
    })
  }

  return { text, counts }
}
