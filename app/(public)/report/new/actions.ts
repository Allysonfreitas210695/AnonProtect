'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function submitReport(formData: FormData) {
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  
  let trackingCode: string

  try {
    // Generate a simple tracking code (e.g., RPT-XXXX-XXXX)
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    trackingCode = `RPT-${randomPart}`

    await prisma.report.create({
      data: {
        trackingCode,
        type,
        description,
      },
    })
  } catch (error) {
    console.error('Error creating report:', error)
    throw new Error('Erro ao criar denúncia')
  }

  // Redirect outside try/catch
  redirect(`/report/success?code=${trackingCode}`)
}
