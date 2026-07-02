const isDev = process.env.NODE_ENV === 'development'

export const clientLogger = {
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args)
  },
}
