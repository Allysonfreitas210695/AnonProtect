import { PrismaClient, UserRole, ReportStatus, MessageSender } from '@prisma/client'
import { hashPassword } from '../app/_lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed categories
  console.log('📁 Creating categories...')
  const categories = [
    { name: 'Bullying', description: 'Intimidação, humilhação ou violência psicológica repetida' },
    { name: 'Assédio', description: 'Assédio moral, sexual ou qualquer forma de constrangimento' },
    { name: 'Violência', description: 'Agressão física ou ameaças de violência' },
    { name: 'Irregularidade', description: 'Fraude, corrupção ou violação de normas' },
    { name: 'Discriminação', description: 'Preconceito por raça, gênero, orientação sexual, etc.' },
    { name: 'Furto/Roubo', description: 'Apropriação indevida de bens ou valores' },
    { name: 'Vandalismo', description: 'Destruição ou dano ao patrimônio' },
    { name: 'Outro', description: 'Outras ocorrências não listadas acima' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  // Seed users
  console.log('👥 Creating users...')
  const adminPassword = await hashPassword('admin123')
  const supervisorPassword = await hashPassword('super123')

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

  // Seed sample reports
  console.log('📝 Creating sample reports...')
  const sampleReports = [
    {
      trackingCode: 'RPT-DEMO01',
      type: 'Bullying',
      description:
        'Presenciei um colega sendo constantemente humilhado por um grupo de estudantes no corredor.',
      status: ReportStatus.IN_PROGRESS,
      assignedToId: supervisor.id,
    },
    {
      trackingCode: 'RPT-DEMO02',
      type: 'Assédio',
      description: 'Recebi comentários inapropriados de um superior hierárquico durante reunião.',
      status: ReportStatus.PENDING,
    },
    {
      trackingCode: 'RPT-DEMO03',
      type: 'Violência',
      description: 'Houve uma briga física no pátio durante o intervalo.',
      status: ReportStatus.RESOLVED,
      assignedToId: admin.id,
    },
    {
      trackingCode: 'RPT-DEMO04',
      type: 'Irregularidade',
      description: 'Notei irregularidades no processo de compras do departamento.',
      status: ReportStatus.IN_PROGRESS,
      assignedToId: admin.id,
    },
    {
      trackingCode: 'RPT-DEMO05',
      type: 'Discriminação',
      description: 'Presenciei comentários discriminatórios contra um colega.',
      status: ReportStatus.PENDING,
    },
    {
      trackingCode: 'RPT-DEMO06',
      type: 'Vandalismo',
      description: 'Equipamentos da sala de informática foram danificados propositalmente.',
      status: ReportStatus.RESOLVED,
      assignedToId: supervisor.id,
    },
  ]

  for (const report of sampleReports) {
    await prisma.report.upsert({
      where: { trackingCode: report.trackingCode },
      update: {},
      create: report,
    })
  }

  // Add sample messages
  console.log('💬 Creating sample messages...')
  const report1 = await prisma.report.findUnique({ where: { trackingCode: 'RPT-DEMO01' } })
  if (report1) {
    await prisma.message.create({
      data: {
        reportId: report1.id,
        content: 'Obrigado por reportar. Estamos investigando o caso.',
        sender: MessageSender.ADMIN,
      },
    })
    await prisma.message.create({
      data: {
        reportId: report1.id,
        content: 'Vocês já identificaram os envolvidos?',
        sender: MessageSender.USER,
      },
    })
  }

  console.log('✅ Seed completed!')
  console.log('\n📊 Summary:')
  console.log(`  - ${categories.length} categories`)
  console.log(`  - 2 users (1 admin, 1 supervisor)`)
  console.log(`  - ${sampleReports.length} sample reports`)
  console.log('\n🔐 Login credentials:')
  console.log('  Admin: admin@sistema.com / admin123')
  console.log('  Supervisor: supervisor@sistema.com / super123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
