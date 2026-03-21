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

### 13.2.1 Dashboard de Conformidade

Visão analítica e de governança contendo:

- **Cards de Resumo**: Total de denúncias, pendentes, em análise e resolvidas.
- **Métricas de Conformidade**: Monitoramento em tempo real de criptografia AES-256, redação de PII por IA, e gestão de retenção de dados (Art. 15 LGPD).
- **Gráficos**: Distribuição geográfica global e por categoria de ocorrência.

### 13.2.2 Perfil e Direitos do Titular

Página dedicada à gestão de conta do administrador, incluindo:

- **Exportação de Dados (Portabilidade)**: Botão para download de todos os dados do usuário em JSON (Art. 18, V).
- **Direito ao Esquecimento (Anonimização)**: Interface de confirmação para remover permanentemente a identidade do usuário, preservando a integridade estatística (Art. 18, IV).

## 13.3 Internacionalização e Acessibilidade

O sistema conta com um seletor de idiomas dinâmico (PT-BR, EN, ES) que adapta não apenas os textos, mas também os formatos de campos (ex: máscaras de CEP/Postal Code) e as validações de erro em tempo real.

## 13.4 Fluxo do Usuário

O fluxo foi projetado para minimizar o número de cliques. O denunciante completa o processo em 2 passos (incluindo o consentimento granular obrigatório), enquanto o administrador possui um painel de controle centralizado para gerenciar todo o ciclo de vida da denúncia sob as regras da LGPD.
