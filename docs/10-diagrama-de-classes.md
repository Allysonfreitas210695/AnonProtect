# 10 - Diagrama de Classes

## 10.1 Estrutura de Classes Logicas

Dada a arquitetura baseada em Next.js e Prisma, as "classes" do sistema são representadas pelos modelos de dados e pelas Server Actions que encapsulam a lógica de negócio.

## 10.2 Diagrama de Classes UML (PlantUML)

```plantuml
@startuml
skinparam ClassAttributeIconSize 0

class User {
  +id: UUID
  +name: String
  +email: String
  +role: UserRole
  +active: Boolean
  +passwordHash: String
  +login()
  +updateProfile()
}

class Report {
  +id: UUID
  +trackingCode: String
  +description: String
  +status: ReportStatus
  +createdAt: DateTime
  +submit()
  +updateStatus()
  +assignTo(user: User)
}

class Category {
  +id: UUID
  +name: String
  +description: String
  +active: Boolean
}

class Department {
  +id: UUID
  +name: String
}

class Message {
  +id: UUID
  +content: String
  +sender: MessageSender
  +createdAt: DateTime
}

class Attachment {
  +id: UUID
  +url: String
  +type: AttachmentCategory
  +fileName: String
}

User "0..1" -- "*" Report : isAssignedTo >
Department "1" -- "*" User : contains >
Department "1" -- "*" Report : handles >
Category "1" -- "*" Report : classifies >
Report "1" *-- "*" Message : contains >
Report "1" *-- "*" Attachment : contains >
Category "0..1" -- "1" Department : hasDefault >

enum UserRole {
  ADMIN
  SUPERVISOR
}

enum ReportStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  REJECTED
}
@enduml
```

## 10.3 Detalhamento das Relações

O diagrama ilustra a forte coesão organizacional: as denúncias são classificadas por categorias que, por sua vez, apontam para departamentos responsáveis. O usuário administrativo atua sobre as denúncias atribuídas ao seu departamento.
