"use client"

import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { Label } from "@/_components/ui/label"
import { cn } from "@/_lib/utils"
import { useTrackReport } from "@/_hooks/public/use-track-report"

interface TrackFormProps {
  initialCode?: string
}

export function TrackForm({ initialCode }: TrackFormProps) {
  const { form, onSubmit, errors, isSubmitting } = useTrackReport({ initialCode })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2 text-left">
        <Label 
          htmlFor="code" 
          className={cn(
            "text-sm font-medium",
            errors.code && "text-destructive"
          )}
        >
          Código de Acompanhamento
        </Label>
        <Input
          {...form.register("code")}
          type="text"
          id="code"
          placeholder="EX: RPT-X8Y9Z"
          className={cn(
            "h-11 font-mono uppercase",
            errors.code && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.code ? (
          <p className="text-destructive text-xs font-medium">
            {errors.code.message}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground">
            Informe o código de acompanhamento que você recebeu ao enviar a denúncia.
          </p>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full h-11 text-base shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Acessando..." : "Acessar"}
      </Button>
    </form>
  )
}
