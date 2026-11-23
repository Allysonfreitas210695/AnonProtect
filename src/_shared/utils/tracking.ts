import crypto from 'crypto'

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const BLOCK_COUNT = 4
const BLOCK_LENGTH = 4

export function generateTrackingCode(): string {
  const year = new Date().getFullYear()

  const blocks: string[] = []
  for (let b = 0; b < BLOCK_COUNT; b++) {
    let block = ''
    for (let i = 0; i < BLOCK_LENGTH; i++) {
      block += ALPHABET[crypto.randomInt(ALPHABET.length)]
    }
    blocks.push(block)
  }

  return `AP-${year}-${blocks.join('-')}`
}

/**
 * O código de protocolo é a credencial do denunciante: o banco guarda apenas o
 * SHA-256 (hex) dele, nunca o valor em claro. Como o código tem ~79 bits de
 * entropia, o resumo não permite descobrir códigos por tentativa, mesmo com
 * acesso ao banco. A mesma conversão é feita em SQL na migration
 * 20261123120000 (encode(sha256(...), 'hex')), por isso não há segredo aqui.
 */
export function hashTrackingCode(code: string): string {
  return crypto.createHash('sha256').update(normalizeTrackingCode(code), 'utf8').digest('hex')
}

/** Aceita o código digitado com espaços ou letras minúsculas. */
export function normalizeTrackingCode(code: string): string {
  return code.trim().toUpperCase()
}

/** Número do caso exibido no painel (ex.: 42 -> "000042"). */
export function formatCaseNumber(caseNumber: number): string {
  return String(caseNumber).padStart(6, '0')
}
