# 15 - Resultados e Testes

## 15.1 Metodologia de Testes

O sistema foi submetido a testes exploratórios centrados no usuário para validar o ciclo completo da denúncia.

### 15.1.1 Cenário: Ciclo de Vida da Denúncia

1.  **Ação**: Denunciante envia relato de "Bullying".
    - **Resultado**: Código `AP-2025-XXXX` gerado com sucesso.
2.  **Ação**: Administrador faz login.
    - **Resultado**: Denúncia aparece instantaneamente no dashboard como "PENDING".
3.  **Ação**: Administrador responde a denúncia.
    - **Resultado**: Mensagem enviada e log de atividade registrado.
4.  **Ação**: Denunciante consulta o código.
    - **Resultado**: Mensagem do administrador visível sob anonimato.

## 15.2 Desempenho e Estabilidade

Graças ao uso de **Server Components**, o tempo de carregamento inicial (First Contentful Paint) é extremamente baixo. A integração com **PostgreSQL** demonstrou alta performance mesmo em consultas complexas que envolvem múltiplos joins (como a lista de denúncias com categorias e departamentos).

## 15.3 Feedback de Usabilidade

A interface em modo escuro (Dark Mode) foi refinada para reduzir a fadiga visual, utilizando tons de cinza profundos e gradientes sutis, proporcionando uma experiência "premium" que transmite seriedade e confiança, componentes essenciais para um canal de ética.
