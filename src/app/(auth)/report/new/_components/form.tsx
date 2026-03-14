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
    <div className="mx-auto px-4 py-8 lg:py-12 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold lg:text-4xl bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Nova Denúncia
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Preencha o formulário abaixo de forma anônima e segura
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Detalhes da Ocorrência</CardTitle>
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
                        <SelectTrigger className="h-11">
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
                        className="min-h-[150px] lg:min-h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Quanto mais detalhes você fornecer, melhor poderemos investigar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Evidências (Opcional)
                </label>
                <Input type="file" multiple disabled className="h-11 cursor-not-allowed opacity-60" />
                <p className="text-muted-foreground text-[10px] lg:text-xs">
                  Funcionalidade de upload será implementada em breve
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isExecuting} 
                  className="w-full sm:w-auto sm:min-w-[200px] h-12 text-lg shadow-sm"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
