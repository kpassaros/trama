# Validação local — Trama

Recorte inicial aprovado visualmente pelo autor. 13 trilhas, 37 aulas iniciais, 62 referências e 52 páginas HTML.

## Executado localmente

- Build, compilação Python e verificação de sintaxe JavaScript.
- Links locais, âncoras, IDs e preservação do texto no realce de sintaxe.
- Cinco verificações SQL em fixture SQLite, incluindo LEFT JOIN sem cliente e chave duplicada; parsing JavaScript sem execução no CI. No QA local de conteúdo revisado, sete cenários Fetch verificam erros e também o retorno exato nos casos válido/vazio.
- Vinte testes de interface: menu retrátil, temas, busca/filtros, vazio/limpeza, detalhes, cópia, menu móvel, Escape e movimento reduzido.
- Layout das 52 rotas verificado automaticamente em 1440px e 390px, sem overflow horizontal da página ou imagens locais ausentes.
- Tokens de texto medidos acima de 4,5:1 nos pares testados. Isso não certifica conformidade completa WCAG.
- Inspeção visual das telas representativas nos dois temas, incluindo consultas, Fabric, aula, menu móvel e lateral recolhida.
- Auditoria local de padrões comuns de segredo e higiene, sem ocorrências detectadas. Isso não garante ausência de todas as vulnerabilidades.

## Ainda depende da publicação

O relatório acima registra testes locais. Checks remotos e revisão são acompanhados no PR #1 antes do merge. O endereço público só deve ser confirmado depois do deploy e da conferência da página; este arquivo não comprova publicação.

Não houve execução nos ambientes de Fabric, Databricks, Power BI, Excel ou demais produtos. Não houve revisão externa/certificação das aulas. Confira versões, dialetos, esquemas e permissões no ambiente aplicável.

Analytics permanece desligado. Não são coletados perfis, progresso ou dados operacionais pela aplicação.
