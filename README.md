# trama
### Conhecimento em conexão. Código com contexto.

![Trama — rede de conhecimento](assets/brand/trama-logo.svg)

![HTML](https://img.shields.io/badge/HTML-20505A?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-7563AD?style=flat-square&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-20505A?style=flat-square&logo=javascript&logoColor=white)
![Python](https://img.shields.io/badge/Python_build-7563AD?style=flat-square&logo=python&logoColor=white)

Aprender uma ferramenta e consultar quando precisar são partes do mesmo trabalho. A Trama conecta os dois: trilhas para construir base e uma central de referências que explica a intenção, a sintaxe e os cuidados antes de aplicar um código.

## O problema que motivou o projeto

A documentação oficial é indispensável, mas nem sempre é fácil sair de uma pergunta prática para a referência certa. Copiar uma função sem entender granularidade, nulos, contexto e versão pode produzir um resultado convincente — e errado.

A proposta é encurtar essa distância, sem substituir as fontes oficiais nem apresentar um conteúdo inicial como uma formação completa.

## O que você encontra

| Estudar | Consultar | Aplicar com consciência |
|---|---|---|
| 20 trilhas independentes e 44 aulas iniciais | 76 referências pesquisáveis com sintaxe colorida | Intenção, saída esperada, passos e armadilhas |
| Objetivos, pré-requisitos e revisão | SQL, DAX, M, Excel, Power Fx, HTTP, automação, Fabric e web | Fontes oficiais e limites de ambiente |
| Exemplos e exercícios opcionais | Código copiável, busca e filtros | Dados fictícios, sem credenciais |

Trilhas iniciais: **Databricks, SQL, Microsoft Fabric, Power BI, Power Query, Excel, APIs & HTTP, Power Automate, Power Apps, Copilot Studio, HTML, CSS e JavaScript**.

> O catálogo continuará crescendo por revisão editorial. As frentes futuras de Python, engenharia, arquitetura e ciência de dados estão no [plano de curadoria](PLANO-CURADORIA.md); não são cursos já concluídos.

## A experiência

- Identidade **Petróleo + Íris**, logo Trama e fonte local.
- Temas claro/escuro, lateral retrátil no desktop e navegação acessível no celular.
- Cards translúcidos com interação discreta; preferência de redução de movimento respeitada.
- Blocos de código claros nos dois temas, com realce editorial de sintaxe.
- Busca por nome ou intenção, filtros, estados vazios e detalhes expansíveis.
- Sem login, banco remoto, progresso individual, cookies de rastreamento ou armazenamento local.

### Tela real do projeto

As capturas abaixo são da versão aprovada. São servidas pelo endereço do GitHub Pages quando a implantação estiver concluída.

![Página inicial da Trama no desktop](https://kpassaros.github.io/trama/docs/trama-desktop.webp)

<details>
<summary>Ver versão móvel</summary>

![Trama no celular](https://kpassaros.github.io/trama/docs/trama-mobile.webp)

</details>

## Como funciona

```text
content/catalog.json + content/lessons/*.json + content/reference.json
                              ↓
       tools/build.py → views.py + highlight.py
                              ↓
                       public/ (HTML)
                              ↓
           GitHub Actions: auditoria → check → build → Pages
```

**Conteúdo separado da interface:** adicionar uma aula não exige redesenhar o site. O gerador atualiza catálogo, páginas, contagens e navegação a partir dos JSONs.

| Parte | Tecnologia efetivamente usada |
|---|---|
| Interface | HTML semântico, CSS, SVG e JavaScript sem framework |
| Geração estática | Python 3.12+, biblioteca padrão |
| Validação | Python, SQLite, Node.js; Chromium para QA local opcional |
| Publicação preparada | GitHub Actions e GitHub Pages |
| Recursos locais | Logo SVG, Noto Sans WOFF e fundo WebP |

Não há npm install, servidor de aplicação ou dependência remota necessária para navegar. Os badges do README dependem do Shields.io; se não carregarem, a tabela acima preserva a informação. Não há métricas simuladas de acesso, GitHub ou aprendizado.

## Rodar localmente

```bash
python tools/build.py
python -m http.server 8000 --directory public
```

Abra **http://localhost:8000**. No Windows, substitua `python` por `py -3.12`.

### Validar antes de publicar

```bash
python -m py_compile tools/build.py tools/views.py tools/highlight.py
node --check assets/site.js
python tools/qa_static.py
python tools/qa_regressions.py
node tools/qa_examples.mjs
python tools/audit.py
```

O CI verifica a sintaxe dos blocos JavaScript sem executá-los. O QA visual/interativo opcional executa JavaScript local previamente revisado, não é sandbox e não deve receber conteúdo desconhecido; exige Node 24 e Chromium: `node tools/qa_browser.mjs`. Os relatórios locais ficam em `reports/`.

## Publicação segura

O [guia de publicação](PUBLICAR-GITHUB.md) orienta repositório novo ou atualização: versão estável/rollback, branch, Pull Request, checks verdes, merge e conferência do endereço publicado.

O workflow só publica `main`; Pull Requests passam pelos checks, mas não alteram o site de produção. GitHub Pages deve usar **GitHub Actions** como fonte de implantação.

## Limites e segurança

- Exemplos não são executados contra suas ferramentas ou dados reais. Confira esquema, tipo, versão, dialeto, localidade e permissão antes de adaptar.
- Realce de sintaxe é uma apresentação estática, não um editor ou validador completo de linguagem.
- Testes locais de SQL usam uma fixture SQLite; isso não certifica compatibilidade com todos os bancos.
- Analytics está desligado. Qualquer ativação exige revisão da ferramenta, processamento e privacidade. O provedor de hospedagem pode manter logs técnicos próprios.
- Nunca publique segredos, arquivos operacionais, dados reais ou referências internas privadas.
- Não há revisão externa/certificação das formações nem alegação de resultado profissional comprovado.

## Autoria e créditos

Projeto pessoal de **Kaíque Passaros**. Fontes oficiais acompanham aulas e referências.

A imagem de fundo e a fonte têm créditos e termos em [CREDITOS.md](CREDITOS.md). Exemplos de interação enviados do Uiverse inspiraram uma implementação própria; o desenho de ingresso/planta não foi incorporado.

A licença da fonte não se estende automaticamente ao código, conteúdo ou marca. Uma licença de distribuição do projeto inteiro ainda deve ser escolhida pelo autor.

## Transporte de ativos

No envio automatizado inicial, arquivos binários usam representações `.base64`, decodificadas pelo build sem dependência externa. O ZIP completo também contém os binários prontos. O site servido usa WOFF e WebP reais, não essas representações textuais. Se existir uma versão binária no source, ela tem prioridade sobre a representação codificada.

## Ecossistema Google — conteúdo inicial

Inclui Workspace, Sheets, Forms, GA4, Looker Studio / Data Studio, Looker / LookML e Google Cloud. Cada trilha nova começa com uma aula e duas consultas, sem alegação de currículo completo. O guia [GA4 do zero](GA4-INICIO.md) separa criar a propriedade de ativar a coleta: analytics continua desligado nesta etapa.
