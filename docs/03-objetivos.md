# 03 - Objetivos

## 3.1 Objetivo Geral

Desenvolver uma plataforma web de denúncias anônimas denominada **AnonProtect**, que utilize tecnologias modernas de desenvolvimento fullstack para prover um canal seguro, sigiloso e eficiente de comunicação entre denunciantes e instituições.

## 3.2 Objetivos Específicos

Para alcançar o objetivo geral, foram definidos os seguintes objetivos específicos:

- **Implementar um portal público de denúncias**: Permitir a submissão de relatos sem a necessidade de autenticação, garantindo o anonimato desde o primeiro contato.
- **Desenvolver um sistema de rastreamento exclusivo**: Gerar códigos de acompanhamento únicos para que o denunciante possa verificar o progresso de seu relato de forma segura.
- **Criar um dashboard administrativo robusto**: Prover aos gestores uma visão analítica das denúncias através de gráficos de status e distribuição por categorias.
- **Integrar gerenciamento departamental**: Permitir que denúncias sejam encaminhadas para setores específicos (Compliance, RH, Jurídico) de acordo com a categoria da ocorrência.
- **Estabelecer um canal de comunicação bidirecional anonimizado**: Implementar um sistema de chat dentro da denúncia, onde gestores e denunciantes podem trocar mensagens sem que a identidade do denunciante seja revelada.
- **Utilizar autenticação moderna para gestores**: Integrar o **Auth.js** com suporte a provedores sociais (Google) e credenciais seguras para o acesso administrativo.
- **Garantir a persistência e integridade dos dados**: Utilizar o ORM **Prisma** com **PostgreSQL** para gerenciar o modelo de dados de forma escalável e segura.
