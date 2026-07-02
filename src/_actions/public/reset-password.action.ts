'use server'

import { actionClient } from '@/_shared/utils/safe-action'
import { forgotPasswordSchema, resetPasswordSchema } from '@/_schemas/auth'
import { prisma } from '@/_shared/lib/prisma'
import { sendEmail } from '@/_shared/lib/aws'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { logger } from '@/_shared/lib/logger'

export const sendPasswordResetEmailAction = actionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      // To prevent email enumeration, we return success even if user doesn't exist
      if (!user) {
        return { success: true }
      }

      // Generate CSPRNG token
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

      // Delete existing tokens for this identifier
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      })

      // Save token in DB
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      // By omitting the locale, next-intl middleware will automatically redirect to default locale
      const resetUrl = `${appUrl}/reset-password?token=${token}`

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recuperação de Senha - AnonProtect</h2>
          <p>Olá${user.name ? ` ${user.name}` : ''},</p>
          <p>Você solicitou a redefinição de senha para sua conta administrativa no AnonProtect.</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p><strong>Atenção:</strong> Este link expira em 1 hora.</p>
          <p style="color: #666; font-size: 14px; margin-top: 40px;">Se você não solicitou a redefinição de senha, apenas ignore este email.</p>
        </div>
      `

      await sendEmail(email, 'AnonProtect - Recuperação de Senha', htmlBody)

      return { success: true }
    } catch (error) {
      logger.error(error, '[sendPasswordResetEmailAction]')
      return { error: 'Ocorreu um erro ao processar a solicitação.' }
    }
  })

export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { token, password } }) => {
    try {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
      })

      if (!verificationToken) {
        return { error: 'O token fornecido é inválido ou já foi utilizado.' }
      }

      if (new Date() > verificationToken.expires) {
        await prisma.verificationToken.delete({
          where: { token },
        })
        return { error: 'O token expirou. Solicite um novo link de recuperação.' }
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      // Update user password
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { password: hashedPassword },
      })

      // Delete used token
      await prisma.verificationToken.delete({
        where: { token },
      })

      return { success: true }
    } catch (error) {
      logger.error(error, '[resetPasswordAction]')
      return { error: 'Ocorreu um erro ao redefinir a senha.' }
    }
  })
