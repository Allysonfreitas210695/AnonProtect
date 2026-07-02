'use client'

import { QRCodeSVG } from 'qrcode.react'

interface Props {
  trackingCode: string
  baseUrl: string
}

export function TrackingQrCode({ trackingCode, baseUrl }: Props) {
  const url = `${baseUrl}/report/track?code=${trackingCode}`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl bg-white p-3 shadow-md">
        <QRCodeSVG
          value={url}
          size={120}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-muted-foreground max-w-[160px] text-center text-[10px] leading-tight">
        Salve o QR Code para acessar o acompanhamento
      </p>
    </div>
  )
}
