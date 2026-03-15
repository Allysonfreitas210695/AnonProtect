import 'dotenv/config'
import { PrismaClient } from '../src/_generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting simplified seed...')

  const depts = [
    { name: 'RH' },
    { name: 'Jurídico' },
    { name: 'TI' },
    { name: 'Compliance' },
    { name: 'Vendas' },
    { name: 'Operações' },
  ]

  console.log('🏢 Creating departments...')
  for (const d of depts) {
    await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    })
  }

  const compliance = await prisma.department.findUnique({ where: { name: 'Compliance' } })

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

  console.log('📂 Creating categories...')
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

  console.log('✅ Simplified seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
