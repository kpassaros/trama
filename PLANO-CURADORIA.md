# Expansão editorial — estudo e consulta

Este é um backlog de curadoria, não uma lista de cursos já publicados nem um currículo completo de todas as profissões de dados.

## Padrão para uma aula
1. Pergunta real e pré-requisito; objetivo observável.
2. Conceito antes da sintaxe e granularidade explícita.
3. Dados fictícios pequenos, entrada e saída esperadas.
4. Código explicado por etapas e limites de versão/dialeto.
5. Casos de erro: nulos, duplicidade, tipo, permissões e escala.
6. Prática com critérios de verificação; perguntas de recuperação com resposta.
7. Fonte oficial vinculada, versão e status editorial.

## Padrão para uma referência
Intenção → quando usar → exemplo mínimo → resultado esperado → argumentos/etapas → armadilhas → alternativas → fonte. Referências conceituais são distinguidas de comandos executáveis. Não transformar falhas em resultados silenciosos.

## Fases e dependências
| Frente | Sequência proposta | Validação necessária | Status |
|---|---|---|---|
| HTML, CSS, JavaScript | Semântica → tabelas/formulários → cascata/caixas → Grid/Flex → DOM → Fetch | Navegador, teclado, tamanhos, erros HTTP/esquema | 9 aulas iniciais no recorte inicial aprovado |
| SQL e modelagem | Granularidade → NULL → joins → agregação → janelas → planos → fatos/dimensões | Fixtures reproduzíveis, chaves duplicadas, dialetos | Expandir as bases existentes |
| BI e Analytics | Modelo estrela → contexto DAX → medidas → visuais → publicação e segurança | Totais, calendário, BLANK, relações, RLS | Planejado |
| Python para dados | Tipos/funções → ambientes → pandas → NumPy → limpeza → agregação → testes | Versões fixadas, entradas/saídas, missing values e joins | Planejado |
| Engenharia de dados | Batch/incremental → Spark/Delta → idempotência → orquestração → observabilidade | Duplicidade, schema drift, falha e recuperação | Planejado |
| Analytics Engineering | dbt → modelos/ref/source → testes → documentação → CI | Adapter/warehouse, chave única, relação e reconciliação | Planejado |
| Arquitetura e governança | Requisitos → lake/warehouse/lakehouse → contratos → linhagem → acesso → custo | Trade-offs, ameaças, permissões e decisões justificadas | Planejado |
| Estatística e ciência de dados | EDA → amostragem → incerteza → avaliação → pipelines → validação temporal | Leakage, divisão treino/teste, baseline, viés e reprodutibilidade | Planejado |
| Plataforma e colaboração | Git/GitHub → revisão → CI/CD → Docker → ambientes | Comandos em ambiente seguro, segredos fora do repo | Planejado |

## Fontes consultadas para os rascunhos web
- MDN HTML: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content
- MDN CSS: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics
- MDN Layout: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout
- MDN JavaScript: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting
- MDN Fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- PostgreSQL SELECT (referências de consulta): https://www.postgresql.org/docs/current/sql-select.html

## Registro de descoberta para futuras unidades
Documentação localizada; precisa de leitura aprofundada por módulo antes de escrever e publicar as respectivas aulas.
- pandas: https://pandas.pydata.org/docs/user_guide/10min.html
- NumPy: https://numpy.org/doc/stable/user/absolute_beginners.html
- dbt: https://docs.getdbt.com/docs/introduction
- scikit-learn (pipelines): https://scikit-learn.org/stable/modules/compose.html
- scikit-learn (falhas comuns): https://scikit-learn.org/stable/common_pitfalls.html
- scikit-learn (validação): https://scikit-learn.org/stable/modules/cross_validation.html
- Arquiteturas de dados: https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures
- Medallion: https://learn.microsoft.com/en-us/azure/databricks/lakehouse/medallion

## Gate de publicação
Rascunho → revisão de fonte e exemplos → execução de fixtures no ambiente declarado → revisão pedagógica → revisão visual/acessibilidade → aprovação do responsável → release. Não há alegação de validação por especialista externo, certificação ou domínio de todo o ecossistema.

## Recorte Google preparado para revisão

Sete trilhas com uma aula inicial e duas referências cada: Workspace, Sheets, Forms, GA4, Looker Studio / Data Studio, Looker / LookML e Google Cloud. Não é um currículo completo; Apps Script, administração Workspace, BigQuery avançado e integração analítica são próximos módulos, ainda não publicados nesta fase.

Fontes oficiais lidas por produto:
- Google Workspace — compartilhar arquivos e pastas: https://support.google.com/a/users/answer/9310248?hl=pt-BR
- Google Workspace — drives compartilhados: https://support.google.com/a/users/answer/9310249?hl=en
- Google Planilhas — QUERY: https://support.google.com/docs/answer/3093343?hl=pt-BR
- Google Formulários — destino e permissões das respostas: https://support.google.com/docs/answer/2917686?hl=pt-BR
- Google Formulários — editar perguntas e seções: https://support.google.com/docs/answer/2839737?hl=pt-BR
- Google Cloud — visão geral: https://docs.cloud.google.com/docs/overview
- Google Cloud — orçamentos e alertas: https://docs.cloud.google.com/billing/docs/how-to/budgets
- BigQuery — sandbox e limitações: https://docs.cloud.google.com/bigquery/docs/sandbox
- Google Analytics — criar conta, propriedade e fluxo: https://support.google.com/analytics/answer/9304153?hl=pt-BR
- Google Analytics — eventos e DebugView: https://support.google.com/analytics/answer/9322688?hl=pt-BR
- Google Analytics — evitar dados pessoais: https://support.google.com/analytics/answer/6366371?hl=pt-BR
- Looker Studio / Data Studio — conectar ao GA4: https://docs.cloud.google.com/data-studio/connect-to-google-analytics
- Looker — introdução ao LookML: https://docs.cloud.google.com/looker/docs/what-is-lookml

Validação de estrutura e exemplos didáticos não equivale à execução em contas Google, Looker ou Cloud. A instrumentação está documentada em GA4-INICIO.md. Esta branch propõe aviso informativo com coleta automática; base legal, configuração externa e recebimento real dependem de validação do titular.
