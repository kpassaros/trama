# Publicar a Trama no GitHub Pages

## Antes do envio

1. Confirme o repositório de destino. Não misture esta base com outro case.
2. Se houver versão em produção, preserve um commit/tag estável para rollback.
3. Crie uma branch específica a partir de main, por exemplo feat/trama-release.
4. Envie os arquivos à raiz: content, assets, tools, .github e documentação. public contém a versão gerada, mas o workflow a recria a partir dos arquivos-fonte.
5. Crie um Pull Request para main. Não apague arquivos antigos sem verificar quais pertencem à solução substituída.

## Conferência e merge

- O workflow de Pull Request deve concluir **Auditoria, check e build**.
- Confira a prévia aprovada e a descrição do PR; não faça merge com check vermelho.
- Após os checks ficarem verdes, faça merge para main.
- Mantenha a branch até homologar a versão publicada.

## Configurar Pages

No repositório: Settings → Pages → Build and deployment → Source → GitHub Actions.

O GitHub pode exigir que você habilite Actions ou tenha permissão administrativa para Pages. Repositórios privados dependem do plano aplicável. Sem repositório e Pages configurados, este pacote não tem endereço público garantido.

Após o merge, o workflow gera o site, envia public como artefato e publica no ambiente github-pages. Use o endereço retornado pelo job deploy; não invente uma URL de sucesso antes da conclusão.

## Testar o deploy

- Início, trilha Fabric e aula de JavaScript.
- Consultas: busca, filtro, copiar e detalhes.
- Temas claro/escuro e lateral recolhida/expandida.
- Celular: menu, foco, Escape, textos e código.
- Recursos locais: fonte, logo e imagem de fundo.
- Confira que não há erros de rede/console nem caminhos absolutos de sandbox.

## Rollback

Em um PR, reverta o commit de release para a revisão estável identificada antes da mudança. Confirme os checks e o deploy de rollback; preserve o histórico. Evite force push e exclusão da branch principal.

## Uso pelo upload do navegador

Extraia o ZIP. Envie **o conteúdo** à raiz, não o ZIP e nem uma pasta externa envolvendo tudo. O navegador pode omitir pastas ocultas: confira expressamente .github/workflows/pages.yml.

Para garantir a pasta .github, pode criar o arquivo pelo GitHub em Add file → Create new file usando o caminho .github/workflows/pages.yml e copiar o conteúdo correspondente do pacote. Depois faça commit na branch e abra o PR.
