# GA4 da Trama — configuração inicial e plano de mensuração

Status: integração preparada na branch de revisão com ID `G-4SFQY2C6J3` informado pelo titular. Não comprova deploy ou recebimento de eventos na propriedade. A tag só é carregada no domínio/caminho de produção após aceite explícito; previews locais não coletam.

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
5. Mantenha a medição otimizada desligada para evitar eventos automáticos fora deste contrato e possível duplicação de page_view. A integração usa envio manual único por página. Isso deve ser conferido nos detalhes do fluxo pelo titular.
6. Localize o ID de medição G-… nos detalhes do fluxo. Não compartilhe senha, token ou acesso administrativo em mensagens.
7. Não adicione outro snippet ou Google Tag Manager. A integração está no gerador e nos assets; uma tag adicional pode duplicar eventos e ignorar o consentimento.

## Contrato de eventos implementado no código — conferir após deploy
| Pergunta | Evento | Dados enviados pelo portal |
| --- | --- | --- |
| Quais páginas recebem visitas medidas? | page_view | caminho do site sem parâmetros livres |
| Quais referências são copiadas? | copy_reference | reference_id, tool |
| Quais aulas são escolhidas? | open_lesson | lesson_id, track_id |
| Há buscas sem resultado? | search_outcome | área da busca, quantidade de resultados; sem texto digitado |
| Quais atalhos profissionais são usados? | creator_link_click | link_id e placement; sem URL externa ou conteúdo de mensagens |

`open_lesson` mede cliques em links de aulas, não leitura concluída. `copy_reference` ocorre após a cópia bem-sucedida. A busca usa debounce de 650 ms. Estes eventos customizados não certificam aprendizado nem entrega efetiva ao Google.

## Consentimento e privacidade implementados
- Basic opt-in: nenhuma tag ou ping GA4 antes de aceite. Recusar não limita o portal.
- Aviso em `privacidade.html`; escolha, versão e validade por até 180 dias no armazenamento local. Com armazenamento bloqueado, a escolha pode valer só na página atual.
- Preferências no rodapé: revogação bloqueia novos disparos, remove cookies da Trama acessíveis ao site e recarrega páginas que já carregaram a tag. Não apaga dados já enviados. Alterações em outra aba são observadas por `storage`.
- URL enviada é canônica sem parâmetros/hash; referrer enviado é reduzido à origem. Parâmetros/hash livres são removidos do endereço atual antes de carregar a tag, sem recarregar a página. A busca inicial já foi aplicada.
- Cookies GA4 usam prefixo `trama`, domínio host-only e caminho `/trama/`, sem remover cookies do portfólio. Publicidade/Google Signals desativados no código.
- A página de privacidade nunca carrega a tag, mesmo com aceite salvo. Isso permite abrir o aviso sem iniciar coleta.
- Não enviar nome, e-mail, texto de busca, conteúdo copiado ou identidade própria. Revisar URL, referer, medição otimizada, retenção e recursos de publicidade antes de ligar a coleta.
- Consentimento não é certificação legal; o responsável deve verificar regras aplicáveis.
- `send_page_view:false` no código; envio manual uma vez por documento. A propriedade deve manter medição otimizada desligada.
- QA local offline usa gtag simulado e bloqueia todas as requisições externas; não comprova DebugView, Tempo real, entrega ou processamento no Google.

## Conferência pelo titular antes e depois da publicação
1. Confira fluxo Web, ID, domínio, fuso, retenção e medição otimizada desligada. Revise compartilhamento e recursos de publicidade na propriedade.
2. Leia o aviso de privacidade e confirme que corresponde ao uso pretendido e às regras aplicáveis. A Trama não garante anonimato absoluto.
3. Após checks verdes, revisão, merge e deploy, abra uma janela privada. Antes de aceitar e após recusar, a aba Network não deve mostrar a tag GA4 ou requests de coleta gerados pelo portal.
4. Aceite explicitamente. Confirme uma tag e uma visualização por página em Network e Tempo real. Abra aula, copie uma referência, busque e clique em um atalho profissional; confira os eventos disponíveis. Bloqueadores podem impedir entrega.
5. Para DebugView, use uma sessão de diagnóstico autorizada com `debug_mode` habilitado apenas temporariamente ou a ferramenta de depuração do Google. A implementação normal não habilita debug_mode para todos. Não confunda o stub local com dados reais.
6. Retire o aceite e confira recarga, recusa persistida e ausência de novos disparos. Confira relatórios processados depois do período de processamento do serviço.
7. Para desligar o portal, defina `analytics.enabled` como `false` em `config.json` e publique novo build. O QA estrutural suporta o estado desligado.
- Dados agregados medidos não cobrem todos os visitantes. Recusas, bloqueadores, testes próprios e baixo tráfego devem constar nas limitações do case.

## Fontes oficiais
- https://support.google.com/analytics/answer/9304153?hl=pt-BR
- https://support.google.com/analytics/answer/9322688?hl=pt-BR
- https://support.google.com/analytics/answer/6366371?hl=pt-BR

- https://developers.google.com/tag-platform/security/guides/consent
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
