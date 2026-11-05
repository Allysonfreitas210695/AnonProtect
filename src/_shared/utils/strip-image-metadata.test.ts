import { describe, it, expect, vi, afterEach } from 'vitest'
import { stripImageMetadata, ImageMetadataStripError } from './strip-image-metadata'

function mockCanvas(blobType: string | null) {
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
    cb(blobType ? new Blob(['x'], { type: blobType }) : null)
  })
  return drawImage
}

describe('stripImageMetadata', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('re-encodes jpeg through canvas and returns a new neutral file', async () => {
    const close = vi.fn()
    const bitmapFn = vi.fn().mockResolvedValue({ width: 10, height: 20, close })
    vi.stubGlobal('createImageBitmap', bitmapFn)
    const drawImage = mockCanvas('image/jpeg')
    const original = new File(['abc'], 'minha-foto-casa.jpg', { type: 'image/jpeg' })

    const result = await stripImageMetadata(original)

    expect(bitmapFn).toHaveBeenCalledWith(original, { imageOrientation: 'from-image' })
    expect(drawImage).toHaveBeenCalled()
    expect(result).not.toBe(original)
    expect(result.type).toBe('image/jpeg')
    expect(result.name).not.toContain('minha-foto')
    expect(close).toHaveBeenCalled()
  })

  it.each(['application/pdf', 'image/gif'])('passes %s through untouched', async (type) => {
    const bitmapFn = vi.fn()
    vi.stubGlobal('createImageBitmap', bitmapFn)
    const file = new File(['abc'], 'a', { type })

    expect(await stripImageMetadata(file)).toBe(file)
    expect(bitmapFn).not.toHaveBeenCalled()
  })

  it('throws when createImageBitmap is unavailable', async () => {
    vi.stubGlobal('createImageBitmap', undefined)
    const file = new File(['abc'], 'a.png', { type: 'image/png' })
    await expect(stripImageMetadata(file)).rejects.toBeInstanceOf(ImageMetadataStripError)
  })

  it('throws when createImageBitmap rejects', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bad')))
    const file = new File(['abc'], 'a.png', { type: 'image/png' })
    await expect(stripImageMetadata(file)).rejects.toBeInstanceOf(ImageMetadataStripError)
  })

  it('throws when canvas context is null', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 1, height: 1, close: vi.fn() })
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const file = new File(['abc'], 'a.webp', { type: 'image/webp' })
    await expect(stripImageMetadata(file)).rejects.toBeInstanceOf(ImageMetadataStripError)
  })

  it('throws when toBlob yields null', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 1, height: 1, close: vi.fn() })
    )
    mockCanvas(null)
    const file = new File(['abc'], 'a.jpg', { type: 'image/jpeg' })
    await expect(stripImageMetadata(file)).rejects.toBeInstanceOf(ImageMetadataStripError)
  })
})
