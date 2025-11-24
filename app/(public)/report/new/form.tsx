'use client'

import { useEffect, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createReport } from '@/app/actions/reports'
import { reportSchema, type ReportInput } from '@/app/schemas/report'
import { Button } from "@/app/_components/ui/button"
import { Textarea } from "@/app/_components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import { Input } from "@/app/_components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

export default function NewReportForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createReport, null)
  
  const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "",
      description: "",
    },
  })

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="max-w-2xl mx-auto my-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Nova Denúncia</h1>
        <p className="text-muted-foreground">
          Preencha o formulário abaixo de forma anônima e segura
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Ocorrência</CardTitle>
          <CardDescription>
            Todas as informações são confidenciais e seu anonimato é garantido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              {/* Hidden inputs to ensure values are sent in FormData */}
              <input type="hidden" name="type" value={form.watch('type')} />
              <input type="hidden" name="description" value={form.watch('description')} />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Ocorrência</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="OTHER" disabled>Nenhuma categoria disponível</SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o ocorrido com o máximo de detalhes possível..."
                        className="min-h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Quanto mais detalhes você fornecer, melhor poderemos investigar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Evidências (Opcional)
                </label>
                <Input type="file" multiple disabled />
                <p className="text-sm text-muted-foreground">
                  Funcionalidade de upload será implementada em breve
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <SubmitButton />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type="submit" 
      size="lg"
      disabled={pending}
      className="min-w-[150px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        'Enviar Denúncia'
      )}
    </Button>
  )
}
