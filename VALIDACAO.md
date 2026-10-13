# Validação local — aviso informativo, métricas e documentos

Branch de revisão, sem autorização presumida de publicação. Base de rollback: commit `70504289300464b792b762bb4981319b0c6d7cca` da main. O modo publicado anteriormente é opt-in; esta proposta muda a coleta para automática com aviso informativo, conforme solicitação do titular.

## Conteúdo e testes
- 20 trilhas, 44 aulas iniciais, 76 referências e 68 páginas HTML, incluindo Privacidade e Termos de Uso.
- Build, sintaxe Python/JavaScript, links, âncoras, IDs, realce e regressões aprovados.
- 5 checks SQL em SQLite e parsing de 6 blocos JavaScript sem executar exemplos no CI.
- 20 checks gerais locais; 68 rotas em 1440px/390px sem overflow horizontal da página ou imagens locais ausentes.
- 26 checks de analytics offline com interceptação de todos os requests e gtag simulado: início antes de fechar o aviso; nenhum falso consentimento; dispensa separada da preferência; foco/fechamento via Escape; minimização de URL/referrer; uma visualização por documento; eventos de cópia, busca, links e aula; desativação; preservação dos cookies do portfólio; migração de recusas antigas; preferência vencida; documentos sem tag; armazenamento bloqueado; preview sem GA4.
- Desligamento global testado com rebuild: sem analytics.js no HTML, mantendo Privacidade e Termos disponíveis.
- Configuração rejeita modo desconhecido, falso consent_required, anúncios habilitados, ID/base inválidos e prazo inválido. Não valida base legal.
- Capturas representativas do modal desktop/celular, tema escuro e documentos completos no celular inspecionadas; espaçamento revisado. Não equivale à revisão visual manual de cada aula ou auditoria WCAG integral.
- Auditoria de padrões comuns de segredo sem ocorrências; não é certificação de segurança.

## Cookies e limite jurídico
Sim, o GA4 desta proposta usa cookies para distinguir navegadores e sessões. O prefixo, domínio host-only, caminho e prazo são configurações enviadas à tag; o comportamento interno e os cookies reais do fornecedor não foram auditados por estes testes com stub. Dados agregados não significam anonimato absoluto.

O titular pediu aviso sem aceite. Entendi apenas fecha o modal; não há comandos ou registros que tratem esse clique como consentimento. Base legal, requisitos contratuais do Google e regras aplicáveis ao público devem ser confirmados/documentados pelo responsável antes da publicação. `legal_basis_review_status` permanece `pending_owner_validation`; não se afirma que legítimo interesse ou dispensa de consentimento estejam juridicamente validados.

## Limites de validação e release
Zero eventos enviados ao Google no QA local. Conta/propriedade não foram acessadas. Não comprova recebimento em Tempo real/DebugView, processamento, configuração externa, anonimato ou conformidade jurídica. As instruções reais estão em GA4-INICIO.md.

CI remoto, aprovação da prévia/documentos, base legal e deploy são etapas distintas. Não realizar merge automático nesta entrega.
