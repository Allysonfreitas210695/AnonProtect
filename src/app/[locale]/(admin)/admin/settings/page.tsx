import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { CategoryForm } from './_components/category-form'
import { CategoryActions } from './_components/category-actions'
import { DepartmentForm } from './_components/department-form'
import { DepartmentActions } from './_components/department-actions'
import { getAllCategories } from '@/_modules/category/category.query'
import { getAllDepartments } from '@/_modules/department/department.query'
import { getCurrentUser } from '@/_shared/lib/auth'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'ADMIN') {
    redirect('/admin')
  }

  const [categories, departments] = await Promise.all([getAllCategories(), getAllDepartments()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as categorias e departamentos do sistema
        </p>
      </div>

      {/* Categorias */}
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

      {/* Departamentos */}
      <div className="grid gap-6">
        <div className="flex items-center gap-2">
          <Building2 className="text-primary h-5 w-5" />
          <h2 className="text-xl font-bold">Departamentos</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Departamento</CardTitle>
            <CardDescription>
              Adicione um departamento para receber encaminhamentos de denúncias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departamentos Cadastrados</CardTitle>
            <CardDescription>{departments.length} departamento(s) no total</CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                Nenhum departamento cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-card hover:bg-muted/50 flex flex-col gap-4 rounded-lg p-4 shadow-md transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{dept.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 justify-end">
                      <DepartmentActions id={dept.id} name={dept.name} />
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
