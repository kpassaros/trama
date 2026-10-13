# GA4 da Trama — configuração inicial e plano de mensuração

Status: guia de configuração; conta e propriedade devem ser criadas pelo titular. Nenhuma tag foi ativada no portal nesta atualização.

## Estrutura sugerida
- Conta: Trama
- Propriedade: Trama — Web
- Fluxo: Site Trama, tipo Web
- URL: https://kpassaros.github.io/trama/
- Fuso e moeda: escolha os que correspondem ao seu projeto. Para um projeto no horário de Brasília, use o fuso correspondente; BRL se essa for sua moeda de relatório.

## Passo a passo
1. Entre em https://analytics.google.com com sua conta Google. Se aparecer uma conta antiga, não a apague. Em Administrador, use Criar → Conta; na primeira utilização pode aparecer Começar a usar.
2. Nomeie a conta e revise compartilhamento de dados opcional.
3. Crie a propriedade, confira fuso e moeda. Preencha categoria, tamanho e objetivo conforme a realidade do projeto; revise termos antes de aceitar.
4. Crie um fluxo Web para a URL HTTPS da Trama. Nomeie-o Site Trama.
5. Nesta fase, mantenha a medição otimizada desligada para revisarmos quais eventos automáticos são adequados. A coleta dependerá da tag implementada posteriormente.
6. Localize o ID de medição G-… nos detalhes do fluxo. Não compartilhe senha, token ou acesso administrativo em mensagens.
7. Pare antes de instalar qualquer snippet manualmente. A integração deve ser feita no gerador e nos assets, não só no HTML de uma página gerada.

## Contrato de eventos proposto — ainda não implantado
| Pergunta | Evento | Dados mínimos propostos |
| --- | --- | --- |
| Quais páginas recebem visitas medidas? | page_view | caminho do site sem parâmetros livres |
| Quais referências são copiadas? | copy_reference | reference_id, tool |
| Quais aulas são escolhidas? | open_lesson | lesson_id, track_id |
| Há buscas sem resultado? | search_outcome | área da busca, quantidade de resultados; sem texto digitado |

Prefira eventos recomendados quando disponíveis e adequados; estes contratos customizados precisam de revisão antes de implementação.

## Privacidade e testes antes da coleta
- Caminho conservador proposto: não carregar gtag nem enviar eventos antes de aceite; recusa mantém o portal funcional. Revisar aviso de privacidade, armazenamento da preferência e controle de revogação.
- Não enviar nome, e-mail, texto de busca, conteúdo copiado ou identidade própria. Revisar URL, referer, medição otimizada, retenção e recursos de publicidade antes de ligar a coleta.
- Consentimento não é certificação legal; o responsável deve verificar regras aplicáveis.
- Definir uma única fonte para page_view e evitar duplicação entre coleta automática e manual.
- Testar aceite/recusa, navegação entre páginas, repetição de eventos, DebugView, Tempo real e dados processados.
- Dados agregados medidos não cobrem todos os visitantes. Recusas, bloqueadores, testes próprios e baixo tráfego devem constar nas limitações do case.

## Fontes oficiais
- https://support.google.com/analytics/answer/9304153?hl=pt-BR
- https://support.google.com/analytics/answer/9322688?hl=pt-BR
- https://support.google.com/analytics/answer/6366371?hl=pt-BR
