# 13 - Telas do Sistema

## 13.1 Interface do Denunciante (Pública)

### 13.1.1 Página Inicial (Landing Page)

A porta de entrada do sistema foca em transmitir segurança e simplicidade. Apresenta o objetivo do projeto e botões claros para "Nova Denúncia" e "Acompanhar Denúncia".

### 13.1.2 Formulário de Denúncia

Uma interface limpa que guia o usuário no preenchimento do relato. Inclui campos para:

- Descrição detalhada (com contador de caracteres).
- Seleção de categoria via dropdown.
- Upload de evidências (implementação futura/parcial).

### 13.1.3 Tela de Sucesso e Rastreio

Após o envio, o sistema exibe o **Identificador Exclusivo de Rastreio**. Esta tela inclui um aviso crítico de que o código não pode ser recuperado se perdido, reforçando o protocolo de segurança.

## 13.2 Área Administrativa (Restrita)

### 13.2.1 Dashboard

Visão analítica contendo:

- **Cards de Resumo**: Total de denúncias, pendentes, em análise e resolvidas.
- **Gráficos**: Distribuição de ocorrências por categoria e timeline de atividades recentes.

### 13.2.2 Lista de Denúncias

Tabela com filtros por status e departamento, permitindo ao gestor identificar rapidamente casos prioritários.

### 13.2.3 Dossiê de Investigação (Detalhes)

A tela mais complexa do sistema, contendo:

- Timeline de eventos (logs).
- Notas internas privadas para investigação.
- Interface de chat para comunicação com o denunciante.
- Botões de ação para alterar status ou encaminhar departamento.

## 13.3 Fluxo do Usuário

O fluxo foi projetado para minimizar o número de cliques. O denunciante completa o processo em 2 passos, enquanto o administrador possui um painel de controle centralizado para gerenciar todo o ciclo de vida da denúncia.
