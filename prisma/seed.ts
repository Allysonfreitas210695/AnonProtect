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

  // Step 0: Cleanup
  console.log('🧹 Cleaning database...')
  await prisma.activityLog.deleteMany()
  await prisma.investigationNote.deleteMany()
  await prisma.message.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  await prisma.department.deleteMany()

  // Step 1: Departments
  console.log('🏢 Creating departments...')
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
    const dept = await prisma.department.create({
      data: d,
    })
    createdDepts.push(dept)
  }

  const compliance = createdDepts.find((d) => d.name === 'Compliance')

  // Step 2: Categories
  console.log('📂 Creating categories...')
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
    await prisma.category.create({
      data: {
        name,
        description: `Relatos de ${name}`,
        defaultDepartmentId: compliance?.id,
      },
    })
  }

  // Step 3: Users
  console.log('👥 Creating administrative users...')
  // Hashed password for 'admin123' and 'super123' (bcrypt)
  const HASHED_PASSWORD = '$2a$10$wR.pD1Mv.W3m.L8M.u.e.eXF.mE.xU.jD.qW.zD.vS.yG'

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@admin.com',
        name: 'Administrador Global',
        role: UserRole.ADMIN,
        password: HASHED_PASSWORD,
        departmentId: compliance?.id,
      },
      {
        email: 'supervisor@supervisor.com',
        name: 'Supervisor RH',
        role: UserRole.SUPERVISOR,
        password: HASHED_PASSWORD,
        departmentId: createdDepts.find((d) => d.name === 'RH')?.id,
      },
    ],
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
