# Validação local — expansão Google da Trama

Conteúdo preparado para revisão, ainda não aprovado como release. O visual base da Trama já havia sido aprovado pelo autor. O build deste recorte contém 20 trilhas, 44 aulas iniciais, 76 referências e 66 páginas HTML.

## Executado localmente
- Build e verificação de sintaxe Python/JavaScript.
- Links, IDs, âncoras, preservação do texto no realce e regressões de segurança do gerador.
- Cinco verificações SQL com fixtures SQLite; parsing de seis blocos JavaScript sem executar snippets em CI.
- Vinte checks interativos locais; dimensões das 66 rotas em 1440px e 390px sem overflow horizontal da página ou imagens locais ausentes.
- Revisão visual das capturas representativas: aula de GA4 no desktop e catálogo ampliado no celular. Layout base preservado.
- Fontes oficiais consultadas para os sete produtos, registradas no plano de curadoria e nas aulas.
- Auditoria de padrões comuns de segredo sem ocorrências. Não certifica segurança completa nem conformidade WCAG integral.

## Limites e status
As sete trilhas Google têm uma aula inicial e duas referências cada; não são formações completas. Não houve execução dentro de contas Google Sheets, Forms, GA4, Workspace, Looker ou Google Cloud, nem criação de contas, habilitação de billing ou configuração de dashboards externos. Fórmulas, LookML e instruções de interface exigem conferência no ambiente do leitor.

Checks remotos, revisão e deploy devem ser conferidos no PR desta expansão. Este relatório não comprova publicação externa.

Analytics permanece desligado. GA4-INICIO.md orienta o titular a criar conta/propriedade/fluxo; instalar a tag, consentimento, armazenamento da preferência e testes de coleta são uma etapa posterior e separada.
