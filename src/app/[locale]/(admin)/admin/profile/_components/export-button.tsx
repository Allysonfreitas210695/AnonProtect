'use client'

import { useState } from 'react'
import { Loader2, FileJson } from 'lucide-react'
import { Button as UIButton } from '@/_components/ui/button'
import { exportUserData } from '@/_actions/admin/export-data'
import { toast } from 'sonner'

export function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const result = await exportUserData()

      // Converte para JSON e cria o download
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meus-dados-anonprotect-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      toast.error('Erro ao exportar seus dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <UIButton
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="hover:border-primary hover:bg-primary/5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileJson className="h-4 w-4" />
      )}
      <span>Exportar Meus Dados (LGPD)</span>
    </UIButton>
  )
}
