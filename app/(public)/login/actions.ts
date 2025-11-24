'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: 'Email e senha são obrigatórios' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email, active: true },
    })

    if (!user) {
      return { success: false, message: 'Credenciais inválidas' }
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return { success: false, message: 'Credenciais inválidas' }
    }

    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Erro ao fazer login' }
  }

  // Redirect OUTSIDE the try/catch so Next.js can handle it properly
  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  redirect('/login')
}
