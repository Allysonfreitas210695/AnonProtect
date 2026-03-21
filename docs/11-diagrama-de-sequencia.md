# 11 - Diagrama de Sequência

## 11.1 Fluxo de Submissão de Denúncia

Este diagrama ilustra o processo desde o preenchimento do formulário pelo denunciante até a persistência no banco de dados e o retorno do código de rastreio.

```plantuml
@startuml
actor Denunciante
participant "Frontend (Page)" as UI
participant "Server Action (createReport)" as Action
participant "Prisma ORM" as Prisma
database "PostgreSQL" as DB

Denunciante -> UI: Preenche Formulário (com consentimento IA) e Envia
UI -> Action: Executa Ação de Servidor (Payload + TurnstileToken)
Action -> Action: Valida Dados (Zod Schema: acceptAi, acceptTerms)
Action -> Action: Verifica Turnstile (Cloudflare API)
Action -> Action: Gera Código Único e Criptografa Relato (AES)
Action -> Prisma: report.create(data)
Prisma -> DB: INSERT INTO reports
DB --> Prisma: OK (ID)
Prisma --> Action: Report Object
Action -> Action: triggerAiAnalysis(reportId)
Action --> UI: Retorna trackingCode
UI -> Denunciante: Exibe Código de Sucesso e Instruções
@enduml
```

## 11.2 Fluxo de Resposta do Administrador

Ilustra como um gestor autenticado interage com o sistema para responder a uma ocorrência.

```plantuml
@startuml
actor Gestor
participant "Admin Dashboard" as UI
participant "Server Action (sendMessage)" as Action
participant "Prisma ORM" as Prisma
database "PostgreSQL" as DB

Gestor -> UI: Digita Mensagem e Clica Enviar
UI -> Action: sendMessageAction(reportId, content)
Action -> Action: Verifica Autenticação (NextAuth)
Action -> Prisma: message.create(data) & activityLog.create()
Prisma -> DB: Transactions (Insert Message + Update Report)
DB --> Prisma: Success
Prisma --> Action: Message Object
Action --> UI: Atualiza Interface de Chat
UI -> Gestor: Confirmação de Envio
@enduml
```
