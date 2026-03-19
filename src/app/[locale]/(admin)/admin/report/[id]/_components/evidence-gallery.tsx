'use client'

import { useTranslations } from 'next-intl'
import { Attachment, AttachmentCategory } from '@/_generated/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { FileText, Image as ImageIcon, Video, Music, Download } from 'lucide-react'
import { Button } from '@/_components/ui/button'
import NextImage from 'next/image'

interface EvidenceGalleryProps {
  attachments: Attachment[]
}

function getIconByCategory(category: AttachmentCategory) {
  switch (category) {
    case AttachmentCategory.PHOTO:
      return <ImageIcon className="h-5 w-5" />
    case AttachmentCategory.VIDEO:
      return <Video className="h-5 w-5" />
    case AttachmentCategory.AUDIO:
      return <Music className="h-5 w-5" />
    case AttachmentCategory.DOCUMENT:
      return <FileText className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

export function EvidenceGallery({ attachments }: EvidenceGalleryProps) {
  const t = useTranslations('Evidence')

  const evidenceByCategory = attachments.reduce(
    (acc, attachment) => {
      const category = attachment.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(attachment)
      return acc
    },
    {} as Record<AttachmentCategory, Attachment[]>
  )

  const stats = {
    total: attachments.length,
    photos: evidenceByCategory[AttachmentCategory.PHOTO]?.length || 0,
    videos: evidenceByCategory[AttachmentCategory.VIDEO]?.length || 0,
    documents: evidenceByCategory[AttachmentCategory.DOCUMENT]?.length || 0,
    audios: evidenceByCategory[AttachmentCategory.AUDIO]?.length || 0,
    others: evidenceByCategory[AttachmentCategory.OTHER]?.length || 0,
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return t('unknownSize')
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  if (attachments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">{t('noEvidence')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-muted-foreground text-xs">{t('total')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.photos}</p>
              <p className="text-muted-foreground text-xs">{t('photos')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.videos}</p>
              <p className="text-muted-foreground text-xs">{t('videos')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.documents}</p>
              <p className="text-muted-foreground text-xs">{t('documents')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.audios}</p>
              <p className="text-muted-foreground text-xs">{t('audios')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.others}</p>
              <p className="text-muted-foreground text-xs">{t('others')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t('attachedEvidence')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    {getIconByCategory(attachment.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {t(attachment.category)}
                      </Badge>
                    </div>
                    <p
                      className="truncate text-sm font-medium print:text-black"
                      title={attachment.fileName}
                    >
                      {attachment.fileName}
                    </p>
                    {attachment.description && (
                      <p className="text-muted-foreground mt-1 text-xs print:text-black">
                        {attachment.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(attachment.fileSize || undefined)}
                      </p>
                      <Button size="sm" variant="ghost" asChild className="h-8">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="mr-1 h-3 w-3" />
                          {t('download')}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview for images */}
                {attachment.category === AttachmentCategory.PHOTO && (
                  <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg">
                    <NextImage
                      src={attachment.url}
                      alt={t('imageAlt', { name: attachment.fileName })}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
