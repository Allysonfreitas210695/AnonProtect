'use client'

import Image from 'next/image'
import { cn } from '@/_lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
}

export function Logo({ className, showText = true, size = 40 }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative overflow-hidden rounded-lg bg-white p-1 shadow-sm ring-1 ring-border/10">
        <Image
          src="/logo.png"
          alt="AnonProtect Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight">AnonProtect</span>
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Proteção Anônima
          </span>
        </div>
      )}
    </div>
  )
}
