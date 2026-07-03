import 'dotenv/config'
import { PrismaClient, UserRole, ReportStatus } from '../src/_generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting robust seed process...')

  const adminEmail = 'admin@sistema.com'
  const superEmail = 'supervisor@sistema.com'

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
  console.log('👥 Processing administrative users (upsert)...')
  // Hashes pré-gerados (bcryptjs, cost 12) — evita recalcular hash em runtime no seed
  // para manter determinismo. ADMIN_PASSWORD_HASH = hash de 'admin123'.
  // SUPERVISOR_PASSWORD_HASH = hash de 'super123'.
  const ADMIN_PASSWORD_HASH = '$2b$12$q5HZqxwRHsXiSW2WKU2iYOucgeq45Vp5XmZRD1oAYn4mlCLQg9Tta'
  const SUPERVISOR_PASSWORD_HASH = '$2b$12$A1xel4LQT6jqV14Qm1pSk.xY4NQeGs2TUj0TZCePFSQg/t8ovX6Di'

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Administrador Global',
      role: UserRole.ADMIN,
      password: ADMIN_PASSWORD_HASH,
      departmentId: compliance?.id,
    },
    create: {
      email: adminEmail,
      name: 'Administrador Global',
      role: UserRole.ADMIN,
      password: ADMIN_PASSWORD_HASH,
      departmentId: compliance?.id,
    },
  })

  await prisma.user.upsert({
    where: { email: superEmail },
    update: {
      name: 'Supervisor RH',
      role: UserRole.SUPERVISOR,
      password: SUPERVISOR_PASSWORD_HASH,
      departmentId: createdDepts.find((d) => d.name === 'RH')?.id,
    },
    create: {
      email: superEmail,
      name: 'Supervisor RH',
      role: UserRole.SUPERVISOR,
      password: SUPERVISOR_PASSWORD_HASH,
      departmentId: createdDepts.find((d) => d.name === 'RH')?.id,
    },
  })

  // Step 4: Sample Reports
  console.log('📝 Creating sample reports...')
  const allCategories = await prisma.category.findMany()

  // Step 4: Sample Reports
  console.log('📝 Creating 25 sample reports with locations and dates...')

  const locations = [
    { city: 'São Paulo', state: 'SP', district: 'Centro', postalCode: '01001-000' },
    { city: 'Rio de Janeiro', state: 'RJ', district: 'Copacabana', postalCode: '22020-001' },
    { city: 'Belo Horizonte', state: 'MG', district: 'Savassi', postalCode: '30140-010' },
    { city: 'Curitiba', state: 'PR', district: 'Batel', postalCode: '80420-000' },
    { city: 'Porto Alegre', state: 'RS', district: 'Moinhos de Vento', postalCode: '90570-000' },
    { city: 'Salvador', state: 'BA', district: 'Pelourinho', postalCode: '40026-280' },
    { city: 'Brasília', state: 'DF', district: 'Asa Sul', postalCode: '70342-000' },
    { city: 'Fortaleza', state: 'CE', district: 'Meireles', postalCode: '60160-230' },
    { city: 'Manaus', state: 'AM', district: 'Adrianópolis', postalCode: '69057-000' },
    { city: 'Recife', state: 'PE', district: 'Boa Viagem', postalCode: '51020-000' },
  ]

  const reportData = [
    {
      category: 'Bullying',
      status: 'PENDING',
      desc: 'Relato de comportamento inadequado persistente na equipe de vendas.',
    },
    {
      category: 'Assédio Moral',
      status: 'IN_PROGRESS',
      desc: 'Superior direto utilizando linguagem agressiva em reuniões.',
    },
    {
      category: 'Assédio Sexual',
      status: 'PENDING',
      desc: 'Comentários inapropriados recorrentes em ambiente comum.',
    },
    {
      category: 'Discriminação',
      status: 'PENDING',
      desc: 'Impedimento de promoção baseado em critérios não profissionais.',
    },
    {
      category: 'Corrupção/Suborno',
      status: 'RESOLVED',
      desc: 'Sugestão de facilitação em troca de benefícios em contrato.',
    },
    {
      category: 'Fraude',
      status: 'IN_PROGRESS',
      desc: 'Irregularidade detectada em notas fiscais de reembolso.',
    },
    {
      category: 'Roubo/Furto',
      status: 'RESOLVED',
      desc: 'Desaparecimento de equipamento eletrônico do depósito.',
    },
    {
      category: 'Uso Indevido de Recursos',
      status: 'PENDING',
      desc: 'Utilização de veículos da empresa para fins particulares.',
    },
    {
      category: 'Segurança do Trabalho',
      status: 'IN_PROGRESS',
      desc: 'Operação sem EPCs adequados na linha de montagem.',
    },
    {
      category: 'Conflito de Interesses',
      status: 'PENDING',
      desc: 'Sócio de fornecedor possui parentesco com gestor de compras.',
    },
    {
      category: 'Vazamento de Dados',
      status: 'RESOLVED',
      desc: 'Exposição acidental de lista de clientes em drive público.',
    },
    {
      category: 'Vandalismo',
      status: 'REJECTED',
      desc: 'Danos intencionais causados em mobiliário de escritório.',
    },
  ]

  // Generate 25 reports
  for (let i = 1; i <= 25; i++) {
    const dataIdx = i % reportData.length
    const locIdx = i % locations.length
    const status = i % 5 === 0 ? 'RESOLVED' : i % 3 === 0 ? 'IN_PROGRESS' : 'PENDING'
    const trackingCode = `AP-2025-${i.toString().padStart(4, '0')}`

    // Spread dates over the last 90 days
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - i * 3)

    const category =
      allCategories.find((c) => c.name === reportData[dataIdx].category) || allCategories[0]

    await prisma.report.upsert({
      where: { trackingCode },
      update: {},
      create: {
        trackingCode,
        description: reportData[dataIdx].desc + ` (Relato ID: ${i})`,
        status: status as ReportStatus,
        categoryId: category.id,
        country: 'Brasil',
        city: locations[locIdx].city,
        state: locations[locIdx].state,
        district: locations[locIdx].district,
        postalCode: locations[locIdx].postalCode,
        createdAt,
        assignedToId: status !== 'PENDING' ? admin?.id : null,
        assignedDepartmentId: category.defaultDepartmentId,
      },
    })
  }

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
