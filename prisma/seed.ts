import { PrismaClient, UserRole, ReportStatus, MessageSender } from '../src/_generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Seed departments
  console.log('🏢 Creating departments...')
  const depts = [
    { name: 'RH', description: 'Recursos Humanos' },
    { name: 'Jurídico', description: 'Assuntos Legais' },
    { name: 'TI', description: 'Tecnologia da Informação' },
    { name: 'Compliance', description: 'Conformidade e Ética' },
  ]

  const createdDepts = []
  for (const dept of depts) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    })
    createdDepts.push(d)
  }

  // Seed users
  console.log('👥 Creating users...')
  const adminPassword = 'admin123'
  const supervisorPassword = 'super123'

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
    },
  })

  // ... (supervisor creation)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@sistema.com' },
    update: {},
    create: {
      email: 'supervisor@sistema.com',
      password: supervisorPassword,
      name: 'Supervisor',
      role: UserRole.SUPERVISOR,
    },
  })

  // Seed sample reports with dates for TTR
  console.log('📝 Creating sample reports...')
  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

  const sampleReports = [
    {
      trackingCode: 'RPT-DEMO01',
      type: 'Bullying',
      description: 'Presenciei um colega sendo constantemente humilhado...',
      status: ReportStatus.IN_PROGRESS,
      assignedToId: supervisor.id,
      assignedDepartmentId: createdDepts[0].id, // RH
      createdAt: fiveDaysAgo,
    },
    {
      trackingCode: 'RPT-DEMO02',
      type: 'Assédio',
      description: 'Recebi comentários inapropriados...',
      status: ReportStatus.PENDING,
      assignedDepartmentId: createdDepts[3].id, // Compliance
      createdAt: twoDaysAgo,
    },
    {
      trackingCode: 'RPT-DEMO03',
      type: 'Violência',
      description: 'Houve uma briga física no pátio...',
      status: ReportStatus.RESOLVED,
      assignedToId: admin.id,
      assignedDepartmentId: createdDepts[0].id,
      createdAt: fiveDaysAgo,
      updatedAt: twoDaysAgo, // 3 days resolution
    },
  ]

  for (const report of sampleReports) {
    await prisma.report.upsert({
      where: { trackingCode: report.trackingCode },
      update: report,
      create: report,
    })
  }

  console.log('✅ Seed completed with Compliance Data!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
