# Validação local — Google, links profissionais e GA4 opt-in

Atualização preparada para revisão em branch, não aprovada como release. O visual base da Trama já havia sido aprovado pelo autor. O build contém 20 trilhas, 44 aulas iniciais, 76 referências e 67 páginas HTML, incluindo privacidade.

## Executado localmente
- Build e sintaxe Python/JavaScript; links, IDs, âncoras, realce e regressões de segurança do gerador.
- Cinco checks SQL com fixtures SQLite e parsing de seis blocos JavaScript sem executar snippets no CI.
- 20 checks interativos gerais; dimensões das 67 rotas em 1440px e 390px sem overflow horizontal da página ou imagens locais ausentes.
- 21 checks de analytics com interceptação offline de todos os requests e gtag simulado: ausência de tag/queue antes de aceite; recusa persistente; reabertura das preferências; aceite; URL/referrer minimizados; anúncios desativados; uma visualização por documento; cópia, busca, clique profissional e link de aula; revogação; separação dos cookies do portfólio; consentimento vencido; privacidade sem tag; armazenamento bloqueado.
- Gate de configuração rejeita ID/base inválidos, consentimento obrigatório desligado, anúncios ligados e prazo inválido. Desligamento global por config foi testado com rebuild: sem script/controles de analytics no HTML.
- Seis links profissionais por documento (três na lateral e três no rodapé), SVGs locais, nomes acessíveis e nova aba com noopener/noreferrer. Contato aponta para o portfólio; nenhum formulário incorporado.
- Capturas representativas inspecionadas: home desktop/celular, privacidade com rodapé no celular e menu aberto em tema escuro. Não equivale a revisão visual manual de cada aula.
- Auditoria de padrões comuns de segredo sem ocorrências; não certifica segurança completa nem conformidade WCAG integral.

## Limites e status
As sete trilhas Google têm uma aula inicial e duas referências cada; não são formações completas. Fontes oficiais e limites de ambiente constam nas aulas e no plano de curadoria. Não houve execução dentro de contas Google Sheets, Forms, Workspace, Looker ou Google Cloud, habilitação de billing ou configuração de dashboards externos.

O ID GA4 foi informado pelo titular e integrado no código. Os testes de analytics usam stub: zero eventos enviados ao Google durante o QA local. Não comprovam recebimento em Tempo real/DebugView, retenção/configuração externa, comportamento interno da tag real ou resultados de relatório.

Conta, propriedade e fluxo não foram acessados pelo agente. O titular deve conferir medição otimizada desligada, retenção, publicidade e aviso de privacidade; seguir GA4-INICIO.md para validação real após publicação. Consentimento não é certificação jurídica e não significa anonimato absoluto.

Checks remotos, revisão, merge e deploy devem ser conferidos no PR. Este documento não comprova publicação externa.
