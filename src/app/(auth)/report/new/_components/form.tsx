'use client'

import { useNewReport } from '@/_hooks/public/use-new-report'
import { Button } from '@/_components/ui/button'
import { Textarea } from '@/_components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/_components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/_components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { Input } from '@/_components/ui/input'
import { Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function NewReportForm({ categories }: { categories: Category[] }) {
  const { form, onSubmit, isExecuting } = useNewReport()

  return (
    <div className="mx-auto my-12 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Nova Denúncia</h1>
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
            <form onSubmit={onSubmit} className="space-y-6">
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
                          <SelectItem value="OTHER" disabled>
                            Nenhuma categoria disponível
                          </SelectItem>
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
                <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Evidências (Opcional)
                </label>
                <Input type="file" multiple disabled />
                <p className="text-muted-foreground text-sm">
                  Funcionalidade de upload será implementada em breve
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" size="lg" disabled={isExecuting} className="min-w-[150px]">
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Denúncia'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
