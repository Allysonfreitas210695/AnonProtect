import 'dotenv/config'
import { PrismaClient, UserRole } from '../src/_generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting robust seed process...')

  const adminEmail = 'admin@admin.com'
  const superEmail = 'supervisor@supervisor.com'

  // Step 0: Cleanup only specific administrative users
  console.log('🧹 Cleaning specific administrative users...')
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [adminEmail, superEmail],
      },
    },
  })

  // Step 1: Departments
  console.log('🏢 Processing departments (upsert)...')
  const depts = [
    { name: 'RH', description: 'Recursos Humanos' },
    { name: 'Jurídico', description: 'Assuntos Legais' },
    { name: 'TI', description: 'Tecnologia da Informação' },
    { name: 'Compliance', description: 'Conformidade e Ética' },
    { name: 'Vendas', description: 'Vendas e Marketing' },
    { name: 'Operações', description: 'Operações e Logística' },
  ]

  const createdDepts = []
  for (const d of depts) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    })
    createdDepts.push(dept)
  }

  const compliance = createdDepts.find((d) => d.name === 'Compliance')

  // Step 2: Categories
  console.log('📂 Processing categories (upsert)...')
  const categories = [
    'Bullying',
    'Assédio Moral',
    'Assédio Sexual',
    'Discriminação',
    'Corrupção/Suborno',
    'Fraude',
    'Roubo/Furto',
    'Vandalismo',
    'Conflito de Interesses',
    'Vazamento de Dados',
    'Uso Indevido de Recursos',
    'Segurança do Trabalho',
    'Lavagem de Dinheiro',
    'Espionagem Industrial',
    'Outras',
  ]

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Relatos de ${name}`,
        defaultDepartmentId: compliance?.id,
      },
    })
  }

  // Step 3: Users
  console.log('👥 Creating administrative users...')
  const HASHED_PASSWORD = '$2a$10$wR.pD1Mv.W3m.L8M.u.e.eXF.mE.xU.jD.qW.zD.vS.yG'

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Administrador Global',
      role: UserRole.ADMIN,
      password: HASHED_PASSWORD,
      departmentId: compliance?.id,
    },
  })

  await prisma.user.create({
    data: {
      email: superEmail,
      name: 'Supervisor RH',
      role: UserRole.SUPERVISOR,
      password: HASHED_PASSWORD,
      departmentId: createdDepts.find((d) => d.name === 'RH')?.id,
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
