import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
})

export const messageSchema = z.object({
  reportId: z.string().uuid(),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type MessageInput = z.infer<typeof messageSchema>
