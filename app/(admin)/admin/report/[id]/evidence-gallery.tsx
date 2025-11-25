import { Attachment } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'
import { FileText, Image, Video, Music, Download } from 'lucide-react'
import { Button } from '@/app/_components/ui/button'

interface EvidenceGalleryProps {
  attachments: Attachment[]
}

function getIconByCategory(category: string) {
  switch (category) {
    case 'PHOTO':
      return <Image className="h-5 w-5" />
    case 'VIDEO':
      return <Video className="h-5 w-5" />
    case 'AUDIO':
      return <Music className="h-5 w-5" />
    case 'DOCUMENT':
      return <FileText className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    PHOTO: 'Foto',
    VIDEO: 'Vídeo',
    AUDIO: 'Áudio',
    DOCUMENT: 'Documento',
    OTHER: 'Outro',
  }
  return labels[category] || 'Outro'
}

function formatFileSize(bytes?: number) {
  if (!bytes) return 'Tamanho desconhecido'

  const kb = bytes / 1024
  const mb = kb / 1024

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  }
  return `${kb.toFixed(2)} KB`
}

export function EvidenceGallery({ attachments }: EvidenceGalleryProps) {
  const evidenceByCategory = attachments.reduce(
    (acc, attachment) => {
      const category = attachment.category || 'OTHER'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(attachment)
      return acc
    },
    {} as Record<string, Attachment[]>
  )

  const stats = {
    total: attachments.length,
    photos: evidenceByCategory.PHOTO?.length || 0,
    videos: evidenceByCategory.VIDEO?.length || 0,
    documents: evidenceByCategory.DOCUMENT?.length || 0,
    audios: evidenceByCategory.AUDIO?.length || 0,
    others: evidenceByCategory.OTHER?.length || 0,
  }

  if (attachments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evidências</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">Nenhuma evidência anexada ainda.</p>
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
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.photos}</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.videos}</p>
              <p className="text-xs text-muted-foreground">Vídeos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.documents}</p>
              <p className="text-xs text-muted-foreground">Documentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.audios}</p>
              <p className="text-xs text-muted-foreground">Áudios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.others}</p>
              <p className="text-xs text-muted-foreground">Outros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Evidências Anexadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    {getIconByCategory(attachment.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(attachment.category)}
                      </Badge>
                    </div>
                    <p className="truncate text-sm font-medium" title={attachment.fileName}>
                      {attachment.fileName}
                    </p>
                    {attachment.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{attachment.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize || undefined)}
                      </p>
                      <Button size="sm" variant="ghost" asChild className="h-8">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="mr-1 h-3 w-3" />
                          Baixar
                        </a>
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(attachment.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Preview for images */}
                {attachment.category === 'PHOTO' && (
                  <div className="mt-3">
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="h-40 w-full rounded-lg object-cover"
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
