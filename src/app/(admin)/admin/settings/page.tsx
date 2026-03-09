import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { getAllCategories } from '@/_data-access/admin/report.query'
import { CategoryForm } from './_components/category-form'
import { CategoryActions } from './_components/category-actions'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
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
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant={category.active ? 'default' : 'secondary'}>
                          {category.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
                      )}
                    </div>
                    <CategoryActions
                      id={category.id}
                      active={category.active}
                      name={category.name}
                    />
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
