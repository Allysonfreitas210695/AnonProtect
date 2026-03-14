'use client'

import { Message } from '@/_generated/prisma'
import { formatTime } from '@/_utils/formatters'
import { cn } from '@/_lib/utils'

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
    <div className="space-y-6">
      {messages.map((msg) => {
        const isCurrentUser = msg.sender === currentUserType
        
        return (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
              isCurrentUser
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none border-primary shadow-primary/10" 
                : "mr-auto bg-card text-card-foreground rounded-tl-none border shadow-sm ring-1 ring-border/50"
            )}
          >
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider opacity-70",
                isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {msg.sender === 'ADMIN' ? 'Administrador' : 'Denunciante'}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            <div className={cn(
              "text-[10px] mt-2 self-end font-medium",
              isCurrentUser ? "text-primary-foreground/60" : "text-muted-foreground/60"
            )}>
              {formatTime(msg.createdAt)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
