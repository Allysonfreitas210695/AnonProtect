'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { assistantChatAction } from '@/_actions/public/ai.action'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Input } from '@/_components/ui/input'
import { Bot, X, Send, User, Sparkles, ShieldCheck } from 'lucide-react'
import { cn } from '@/_lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface Message {
  role: 'user' | 'model'
  text: string
}

import { useParams } from 'next/navigation'

export function WhistleblowerAssistant() {
  const t = useTranslations('NewReport.assistant')
  const params = useParams()
  const locale = params.locale as string
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { execute, isExecuting } = useAction(assistantChatAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.response) {
        setMessages((prev) => [...prev, { role: 'model', text: data.response! }])
      }
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isExecuting) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])

    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }))
    history.push({ role: 'user', parts: [{ text: userMessage }] })

    execute({ history, locale })
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px]"
          >
            <Card className="border-border/50 bg-card/95 ring-primary/20 overflow-hidden shadow-2xl ring-1 backdrop-blur-xl">
              <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-white/20 p-1.5">
                    <Bot className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold">{t('title')}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground h-8 w-8 hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex h-[450px] flex-col p-0">
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scroll-smooth p-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center space-y-3 py-6 text-center">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Sparkles className="text-primary h-6 w-6" />
                      </div>
                      <p className="text-muted-foreground px-4 text-sm">{t('welcome')}</p>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex w-full items-start gap-2',
                        m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <div
                        className={cn(
                          'shrink-0 rounded-md p-1.5',
                          m.role === 'user' ? 'bg-muted' : 'bg-primary/20 text-primary'
                        )}
                      >
                        {m.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                          m.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted text-foreground border-border/50 rounded-tl-none border'
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {isExecuting && (
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/20 text-primary rounded-md p-1.5">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted flex gap-1 rounded-2xl rounded-tl-none px-4 py-2">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="bg-primary h-1.5 w-1.5 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="bg-primary h-1.5 w-1.5 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="bg-primary h-1.5 w-1.5 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-muted/30 border-t p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 px-1 text-[10px]">
                    <ShieldCheck className="text-success h-3 w-3" />
                    <span>{t('anonymityReady')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('placeholder')}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="bg-background/50 border-border/50 h-10"
                    />
                    <Button
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={handleSend}
                      disabled={isExecuting || !input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-primary text-primary-foreground flex items-center gap-3 rounded-2xl p-4 shadow-2xl transition-all',
          isOpen ? 'bg-destructive' : 'hover:bg-primary/90'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Bot className="h-6 w-6" />
            <span className="hidden text-sm font-bold sm:inline">{t('trigger')}</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
