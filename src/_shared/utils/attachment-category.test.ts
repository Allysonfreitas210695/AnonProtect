import { describe, expect, it } from 'vitest'

import { AttachmentCategory } from '@/_generated/prisma'

import { getAttachmentCategory, resolveAttachmentCategory } from './attachment-category'

describe('getAttachmentCategory', () => {
  it('classifica imagens como PHOTO', () => {
    expect(getAttachmentCategory('image/jpeg')).toBe(AttachmentCategory.PHOTO)
    expect(getAttachmentCategory('image/png')).toBe(AttachmentCategory.PHOTO)
  })

  it('classifica PDF como DOCUMENT', () => {
    expect(getAttachmentCategory('application/pdf')).toBe(AttachmentCategory.DOCUMENT)
  })

  it('classifica vídeo e áudio', () => {
    expect(getAttachmentCategory('video/mp4')).toBe(AttachmentCategory.VIDEO)
    expect(getAttachmentCategory('audio/mpeg')).toBe(AttachmentCategory.AUDIO)
  })

  it('usa OTHER para tipos desconhecidos ou ausentes', () => {
    expect(getAttachmentCategory('application/zip')).toBe(AttachmentCategory.OTHER)
    expect(getAttachmentCategory(undefined)).toBe(AttachmentCategory.OTHER)
  })
})

describe('resolveAttachmentCategory', () => {
  it('deriva a categoria de registros antigos gravados como OTHER', () => {
    expect(
      resolveAttachmentCategory({ category: AttachmentCategory.OTHER, type: 'image/jpeg' })
    ).toBe(AttachmentCategory.PHOTO)
  })

  it('mantém a categoria já gravada', () => {
    expect(
      resolveAttachmentCategory({ category: AttachmentCategory.VIDEO, type: 'image/jpeg' })
    ).toBe(AttachmentCategory.VIDEO)
  })
})
