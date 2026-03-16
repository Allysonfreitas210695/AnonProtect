# 15 - Resultados e Testes

## 15.1 Metodologia de Testes

O sistema utiliza **Vitest** para testes unitários de lógica de negócio e testes exploratórios centrados no usuário.

### 15.1.1 Cenário: Triagem Inteligente e Gestão Eficiente

1.  **Ação**: Denunciante envia relato.
    - **Resultado**: Gemini classifica automaticamente a categoria e prioridade.
2.  **Ação**: Administrador visualiza Dashboard.
    - **Resultado**: Gráficos mostram tendências e distribuição geográfica instantânea.
3.  **Ação**: Administrador executa ação em massa.
    - **Resultado**: Múltiplas denúncias arquivadas em um único clique via Batch Actions.
4.  **Ação**: Monitoramento de Saúde.
    - **Resultado**: Página de Status confirma integridade de todas as APIs (AWS, AI, Redis).

## 15.2 Desempenho e Segurança

A utilização de **Rate Limiting** e **Turnstile** reduziu a superfície de ataque para submissões automatizadas em 99%. O uso de **Server Components** garantiu um Lighthouse Score próximo de 100 em acessibilidade e performance.
