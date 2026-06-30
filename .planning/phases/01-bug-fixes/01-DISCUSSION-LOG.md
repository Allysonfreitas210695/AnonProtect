# Phase 1: Bug Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 1-Bug Fixes
**Areas discussed:** Formato do validator (BUG-01), Conteúdo da ToS (BUG-03), Semântica do filtro country (BUG-02)

---

## Formato do validator (BUG-01)

| Opção                                 | Descrição                                                                                | Selecionado |
| ------------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| Atualizar validator para AP-YYYY-XXXX | Regex `AP-\d{4}-[A-Z0-9]{4}` — preserva dados existentes, generator não muda.            | ✓           |
| Mudar generator para RPT-[A-Z0-9]{6}  | Generator passa a criar RPT-format. Códigos já emitidos (AP-format) se tornam inválidos. |             |
| Você decide                           | Claude escolhe a abordagem mais conservadora.                                            |             |

**User's choice:** Atualizar validator para AP-YYYY-XXXX
**Notes:** Dados reais já existem no formato AP — manter compatibilidade.

---

## Testes do validator (BUG-01 follow-up)

| Opção                            | Descrição                                                               | Selecionado |
| -------------------------------- | ----------------------------------------------------------------------- | ----------- |
| Atualizar testes para AP-format  | Remove o comentário de TODO e faz o teste passar com o formato correto. | ✓           |
| Manter comentário como histórico | Deixa o comentário mas atualiza a asserção.                             |             |

**User's choice:** Atualizar testes para AP-format
**Notes:** Limpar o TODO documentado em validators.test.ts.

---

## Conteúdo da ToS (BUG-03)

| Opção                      | Descrição                                                                | Selecionado |
| -------------------------- | ------------------------------------------------------------------------ | ----------- |
| Conteúdo real TCC-adequado | Texto genérico com seções padrão — adequado para apresentação da banca.  | ✓           |
| Placeholder mínimo         | Página com aviso 'Em construção'. Elimina o 404 sem esforço de conteúdo. |             |

**User's choice:** Conteúdo real TCC-adequado
**Notes:** Banca deve ver um sistema completo e profissional.

---

## Layout da ToS (BUG-03 follow-up)

| Opção                              | Descrição                                                            | Selecionado |
| ---------------------------------- | -------------------------------------------------------------------- | ----------- |
| Mesma estrutura que privacy-policy | Reutilizar layout existente mantém consistência visual para a banca. | ✓           |
| Layout próprio                     | Criar componentes novos para a página de ToS.                        |             |

**User's choice:** Mesma estrutura que privacy-policy
**Notes:** Reuso direto — sem novos componentes de layout.

---

## Semântica do filtro country (BUG-02)

| Opção                              | Descrição                                                                                | Selecionado |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| Consolidar em um parâmetro único   | Remover o parâmetro duplicado do contrato da função. Mais limpo, sem ambiguidade futura. | ✓           |
| Manter ambos, corrigir precedência | Documentar qual tem prioridade e fazer a lógica explícita. Menos mudanças no contrato.   |             |

**User's choice:** Consolidar em um parâmetro único
**Notes:** Escolha mais limpa — elimina a ambiguidade na assinatura da função.

---

## Claude's Discretion

- Ordem das seções do conteúdo da ToS (objeto, condições, privacidade, responsabilidade, contato)
- Qual parâmetro manter no merge do BUG-02 (`country` vs `filterCountry`) — baseado nos callers existentes

## Deferred Ideas

Nenhuma ideia fora do escopo surgiu durante a discussão.
