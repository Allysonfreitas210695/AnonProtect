export function getClientIp(hdrs: Headers): string {
  return (
    hdrs.get('cf-connecting-ip') ||
    (hdrs.get('x-forwarded-for') || '').split(',').at(-1)?.trim() ||
    '127.0.0.1'
  )
}
