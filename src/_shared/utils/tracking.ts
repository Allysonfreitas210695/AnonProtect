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
