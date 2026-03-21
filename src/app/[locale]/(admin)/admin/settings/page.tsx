import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { CategoryForm } from './_components/category-form'
import { CategoryActions } from './_components/category-actions'
import { getAllCategories } from '@/_modules/category/category.query'
import { getCurrentUser } from '@/_shared/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'ADMIN') {
    redirect('/admin')
  }

  const categories = await getAllCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie as categorias de denúncias</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Categoria</CardTitle>
            <CardDescription>Adicione uma nova categoria de denúncia</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias Cadastradas</CardTitle>
            <CardDescription>{categories.length} categoria(s) no total</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                Nenhuma categoria cadastrada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-card hover:bg-muted/50 flex flex-col gap-4 rounded-lg p-4 shadow-md transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">{category.name}</h3>
                        <Badge variant={category.active ? 'default' : 'secondary'}>
                          {category.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 justify-end">
                      <CategoryActions
                        id={category.id}
                        active={category.active}
                        name={category.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
