# Como ampliar o conteúdo sem redesenhar o portal

O conteúdo está separado da interface. Não é necessário editar HTML, CSS ou JavaScript para incluir aulas e trilhas no formato atual.

## 1. Acrescentar uma aula a uma trilha existente

1. Copie um JSON de `content/lessons/` como modelo.
2. Dê um ID único, por exemplo `fabric-004`, e use `"track": "fabric"`.
3. Preencha título, nível, minutos estimados, objetivo, introdução e pré-requisitos.
4. Escreva seções (`heading`, `paragraphs` e `code` opcional), prática opcional (`exercise` pode ser omitido), armadilhas, revisão e fontes oficiais.
5. Rode `python tools/build.py` ou, no Windows, `py -3.12 tools/build.py`.

O nome do arquivo deve coincidir com o ID. A ordem atual das aulas vem da ordenação dos nomes dos arquivos; use números com zeros à esquerda. Não renomeie IDs de aulas publicadas sem cuidar de links existentes.

## 2. Acrescentar uma nova trilha

Adicione um objeto ao array `tracks` em `content/catalog.json`:

```json
{
  "id": "nova-ferramenta",
  "name": "Nova ferramenta",
  "category": "Dados & engenharia",
  "icon": "data",
  "description": "Descrição curta da proposta da trilha.",
  "topics": ["Fundamentos", "Primeiros usos", "Aprofundamento"],
  "color": "petrol"
}
```

Use `petrol` ou `iris` para manter a identidade visual. Inclua ao menos uma aula com esse `track` antes de rodar o build. IDs só aceitam letras minúsculas, números e hífens. As categorias da busca são formadas automaticamente pelos valores do catálogo.

## 3. Acrescentar uma referência rápida

Em `content/reference.json`, copie um item e dê um ID único. Campos: `id`, `tool`, `category`, `name`, `description`, `code`, `dialect` , `use` (quando usar), `result` (saída esperada), `steps` (array de passos), `pitfall` (cuidado) e `source` (`label` e `url` HTTPS). Conceitos sem código executável devem indicar claramente que são diagramas ou modelos mentais, não comandos.

## 4. Revisar e publicar

O build recria `public/`: nunca edite somente o HTML gerado, porque será sobrescrito. Abra `public/index.html` ou use o servidor local, confira o card da trilha, ordem de aulas, revisão, código e links. A inclusão gera catálogo, busca, contagens, páginas e links entre aulas automaticamente.

O workflow do GitHub Pages também roda o build a cada push em `main`, quando o repositório e Pages estiverem configurados. Um commit não garante deploy: confira os checks e o endereço publicado. Nesta entrega não houve publicação externa.

O formato atual cobre aulas com texto, código, exercícios opcionais, revisão e fontes. Recursos novos como quizzes com correção, vídeos próprios ou CMS podem exigir alteração dos templates. Não adicione progresso individual ou coleta de dados sem nova autorização.

### Ícones e exemplos em linguagens diferentes

`icon` configura o glifo: abreviações existentes (DB, SQL, FAB etc.) são mapeadas para os SVGs do visual aprovado; `data` e `code` também são aceitos. Valores novos aparecem como texto escapado.

Uma seção pode ter `code` único ou `codeBlocks` (não ambos). Para HTML + JavaScript, use `codeBlocks: [{"language":"html","label":"HTML · index.html","code":"…"},{"language":"javascript","label":"JavaScript · contador.js","code":"…"}]`. Cada bloco tem seu próprio botão de copiar. Indique onde salvar e como carregar os arquivos. IDs de trilhas, aulas e referências usam apenas letras minúsculas, números e hífens.
