# 08 - Modelagem do Sistema

## 8.1 Abstração do Domínio

A modelagem do sistema **AnonProtect** foi estruturada para refletir a necessidade de uma comunicação assíncrona e segura. O domínio do sistema é centrado na entidade **Denúncia** (Report), que serve como o hub de todas as interações.

## 8.2 Entidades Principais

- **Denúncia (Report)**: O objeto central que contém a descrição do incidente, o código de rastreio único e o status atual.
- **Usuário (User)**: Representa os entes administrativos (Administradores e Supervisores) que possuem credenciais de acesso. O denunciante não é uma entidade "Usuário" no banco, preservando o anonimato.
- **Categoria (Category)**: Classificação da denúncia (ex: Bullying, Fraude), que ajuda no direcionamento e na análise estatística.
- **Departamento (Department)**: Estrutura organizacional para onde as denúncias são encaminhadas (RH, Jurídico, Compliance).
- **Mensagem (Message)**: Registros da conversa entre o denunciante (via tracking code) e o administrador.
- **Log de Atividade (ActivityLog)**: Rastro de auditoria de todas as ações realizadas sobre uma denúncia, garantindo transparência no processo investigativo.

## 8.3 Relacionamentos de Alto Nível

O sistema utiliza relacionamentos relacionais estritos:

- Uma **Denúncia** pertence a uma **Categoria**.
- Uma **Denúncia** é atribuída a um **Departamento** e, opcionalmente, a um **Usuário** específico.
- Uma **Denúncia** possui múltiplas **Mensagens** e **Evidências** (Attachments).
- Uma **Categoria** tem um **Departamento** padrão para encaminhamento automático.
