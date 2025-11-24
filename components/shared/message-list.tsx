'use client'

import { Message } from '@prisma/client'
import { formatTime } from '@/lib/utils/formatters'

interface MessageListProps {
  messages: Message[]
  currentUserType: 'USER' | 'ADMIN'
}

export function MessageList({ messages, currentUserType }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhuma mensagem ainda. {currentUserType === 'USER' ? 'Você pode enviar uma mensagem abaixo.' : ''}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isCurrentUser = msg.sender === currentUserType
        
        return (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] rounded-lg p-3 ${
              isCurrentUser
                ? 'ml-auto bg-primary text-primary-foreground rounded-br-none' 
                : 'mr-auto bg-muted text-muted-foreground rounded-bl-none'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <small className="text-xs opacity-70 mt-1 self-end">
              {formatTime(msg.createdAt)}
            </small>
          </div>
        )
      })}
    </div>
  )
}
