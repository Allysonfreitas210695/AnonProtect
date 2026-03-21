# 18 - Trabalhos Relacionados

## 18.1 Estado da Arte em Sistemas de Denúncia (Whistleblowing)

Sistemas como **GlobaLeaks** e **SecureDrop** têm definido o padrão para o anonimato digital, utilizando infraestruturas complexas como a rede Tor. Enquanto essas plataformas focam na segurança extrema da comunicação, o **AnonProtect** diferencia-se ao integrar **Inteligência Artificial (Gemini)** para a triagem e anonimização proativa de dados no momento da submissão, reduzindo a carga cognitiva de análise humana por meio da classificação automática de categorias e prioridades.

## 18.2 Conformidade com LGPD e GDPR em Software

Trabalhos acadêmicos recentes (2023-2024) destacam que a conformidade não é apenas jurídica, mas uma característica de arquitetura (**Privacy by Design**). O AnonProtect implementa os seguintes pilares identificados na literatura nacional e internacional:

- **Minimização de Dados (Art. 6, III LGPD)**: Coleta restrita ao estritamente necessário para a investigação, sem exigência de cadastro para denunciantes.
- **Direito ao Esquecimento (Art. 18, IV LGPD)**: Funcionalidade de anonimização total de perfil, preservando a integridade dos logs de auditoria histórica sem identificar o titular.
- **Gestão de Retenção (Art. 15 LGPD)**: Monitoramento automático do tempo de guarda de dados sensíveis diretamente no dashboard administrativo.

## 18.3 IA Generativa e Ética Corporativa

A utilização de IA para triagem de denúncias é uma área emergente. Segundo pesquisas da _International Anti-Corruption Academy_ (2024), o uso de agentes virtuais e NLP (Natural Language Processing) permite uma resposta mais rápida a crises institucionais. O AnonProtect adota essa tendência ao utilizar modelos de linguagem de grande escala (LLM) para sugerir categorias e realizar a redação (redação) de PIIs, garantindo que o auditor humano receba um dossiê já pré-processado e seguro.

## 18.4 Análise Comparativa

| Recurso              | GlobaLeaks | Whistleblowersoftware |   **AnonProtect**    |
| :------------------- | :--------: | :-------------------: | :------------------: |
| Anonimato de Rede    |    Sim     |          Sim          |  Sim (Zero Log IP)   |
| Criptografia AES-256 |    Sim     |          Sim          |         Sim          |
| Triagem por IA       |    Não     |        Parcial        |   **Sim (Nativa)**   |
| Gestão de Retenção   |   Manual   |          Sim          |    **Automática**    |
| Suporte Multi-idioma |    Sim     |          Sim          | **Sim (Adaptativo)** |

---

_Este documento serve como base teórica para a comparação técnica do sistema desenvolvido em relação às soluções comerciais e acadêmicas existentes no contexto do TCC._
