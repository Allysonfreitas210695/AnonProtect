'use client'

import { Message } from '@/_generated/prisma'
import { formatTime } from '@/_utils/formatters'
import { cn } from '@/_lib/utils'
import { useTranslations } from 'next-intl'

interface MessageListProps {
  messages: Message[]
  currentUserType: 'USER' | 'ADMIN'
}

export function MessageList({ messages, currentUserType }: MessageListProps) {
  const t = useTranslations('Communication')

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="bg-muted/50 ring-border/20 mb-4 rounded-full p-6 ring-1">
          <p className="text-3xl opacity-20">💬</p>
        </div>
        <p className="text-muted-foreground font-medium">{t('noMessages')}</p>
        {currentUserType === 'USER' && (
          <p className="text-muted-foreground/60 text-sm">{t('noMessagesUserHint')}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 py-4">
      {messages.map((msg) => {
        const isCurrentUser = msg.sender === currentUserType

        return (
          <div
            key={msg.id}
            className={cn(
              'relative flex max-w-[85%] flex-col rounded-4xl px-6 py-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl',
              isCurrentUser
                ? 'bg-primary/95 text-primary-foreground border-primary/20 shadow-primary/10 ml-auto rounded-tr-none'
                : 'bg-card/60 text-card-foreground border-border/40 ring-border/30 mr-auto rounded-tl-none border shadow-sm ring-1'
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-4">
              <span
                className={cn(
                  'text-[9px] font-black tracking-widest uppercase transition-opacity',
                  isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                )}
              >
                {msg.sender === 'ADMIN' ? t('admin') : t('user')}
              </span>
            </div>
            <p className="text-md leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
            <div
              className={cn(
                'mt-3 self-end text-[9px] font-bold tracking-tight opacity-60',
                isCurrentUser ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {formatTime(msg.createdAt)}
            </div>
            {isCurrentUser && (
              <div className="bg-primary/30 absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
            )}
          </div>
        )
      })}
    </div>
  )
}
