import { auth } from '@/auth'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

// Nota: createSession e destroySession não são mais necessários com NextAuth
// mas manteremos as assinaturas para evitar quebras imediatas se houver outros usos
export async function createSession(userId: string) {
  console.warn('createSession is deprecated. NextAuth handles sessions automatically.')
}

export async function destroySession() {
  console.warn('destroySession is deprecated. Use NextAuth signOut instead.')
}
