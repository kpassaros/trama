# GA4 da Trama — configuração inicial e plano de mensuração

Status: integração preparada na branch de revisão com ID `G-4SFQY2C6J3` informado pelo titular. Não comprova deploy ou recebimento de eventos na propriedade. Esta branch prepara modo informativo com coleta automática no domínio/caminho de produção, salvo preferência válida de desativação. Previews locais e páginas de Privacidade/Termos não coletam.

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
7. Não adicione outro snippet ou Google Tag Manager. A integração está no gerador e nos assets; uma tag adicional pode duplicar eventos e ignorar os controles de desativação.

## Contrato de eventos implementado no código — conferir após deploy
| Pergunta | Evento | Dados enviados pelo portal |
| --- | --- | --- |
| Quais páginas recebem visitas medidas? | page_view | caminho do site sem parâmetros livres |
| Quais referências são copiadas? | copy_reference | reference_id, tool |
| Quais aulas são escolhidas? | open_lesson | lesson_id, track_id |
| Há buscas sem resultado? | search_outcome | área da busca, quantidade de resultados; sem texto digitado |
| Quais atalhos profissionais são usados? | creator_link_click | link_id e placement; sem URL externa ou conteúdo de mensagens |

`open_lesson` mede cliques em links de aulas, não leitura concluída. `copy_reference` ocorre após a cópia bem-sucedida. A busca usa debounce de 650 ms. Estes eventos customizados não certificam aprendizado nem entrega efetiva ao Google.

## Aviso informativo e controles — decisão de produto do titular
- O titular solicitou retirar o aceite prévio e usar um pop-up informativo. A tag inicia em produção antes de fechar o aviso, salvo desativação salva; Entendi não é consentimento e não ativa métricas.
- A implementação não afirma que a LGPD deixa de se aplicar, nem declara legítimo interesse juridicamente validado. `legal_basis_review_status` registra `pending_owner_validation`. Antes de publicar, o titular deve confirmar e documentar a base legal e regras aplicáveis aos públicos atendidos, inclusive requisitos contratuais do fornecedor. Se a configuração exigir consentimento, este modo não o fornece.
- **Sim, há cookies:** GA4 mantém identificadores para distinguir navegadores/sessões, mesmo com relatórios agregados e sem nome/e-mail enviados pelo portal. Prefixo `trama`, domínio host-only, caminho `/trama/`, prazo configurado de 180 dias por gravação. Publicidade/Google Signals permanecem desligados no código.
- Local storage, separado de cookies, guarda dispensa do aviso (`trama.analytics.notice.v1`) e preferência (`trama.analytics.preference.v2`), versão/validade até 180 dias. Não representa prova de consentimento. Recusas válidas de `trama.analytics.consent.v1` são migradas como desativação, nunca silenciosamente convertidas em ativação.
- Desativar métricas no rodapé bloqueia novos disparos do portal, limpa cookies Trama acessíveis e recarrega quando a preferência foi salva e a tag já carregou. Não elimina automaticamente dados já enviados nem garante cancelamento de requests já em trânsito. Reativação voluntária fica no mesmo controle.
- Se o armazenamento estiver indisponível na carga, o comportamento automático é fail-closed: sem tag. A ativação explícita pelo controle pode valer apenas nesta página; a indisponibilidade fica indicada na interface.
- URL canônica sem parâmetros/hash; referrer enviado reduzido à origem. Parâmetros/hash livres são removidos do endereço antes da tag, preservando a busca inicial aplicada pelo site.js.
- Uma visualização manual por documento; `send_page_view:false`. Manter medição otimizada desligada na propriedade para evitar eventos fora do contrato.
- Privacidade e Termos são gerados mesmo com analytics globalmente desligado e não carregam a tag.
- O modal é fechável por Entendi, X ou Escape. Usa dialog nativo, nome acessível, foco e retorno ao acionador; fechar não muda a preferência de coleta.
- QA offline intercepta todos os requests e usa gtag simulado. Zero dados enviados ao Google; não comprova comportamento interno da tag real, DebugView, Tempo real, cookies reais do fornecedor ou legalidade.
- Dados de uso não cobrem necessariamente todos os visitantes: desativação, bloqueadores, robôs e visitas de teste podem alterar contagens. Não confundir cliques em aula com leitura concluída ou aprendizado.

## Conferência pelo titular antes e depois da publicação
1. Confira fluxo Web, ID, domínio, fuso, retenção e medição otimizada desligada. Revise compartilhamento e recursos de publicidade na propriedade.
2. Leia Termos e Privacidade, defina/documente a base legal e confirme que o modo informativo corresponde às regras aplicáveis. A Trama não garante anonimato absoluto.
3. Após checks verdes, revisão, merge e deploy, abra uma janela privada. Sem uma desativação salva, a tag deve iniciar antes de fechar o aviso; fechar não deve gerar nova visualização.
4. Confirme uma tag e uma visualização por página em Network e Tempo real. Abra aula, copie uma referência, busque e clique em um atalho profissional; confira os eventos disponíveis. Bloqueadores podem impedir entrega.
5. Para DebugView, use uma sessão de diagnóstico autorizada com `debug_mode` habilitado apenas temporariamente ou a ferramenta de depuração do Google. A implementação normal não habilita debug_mode para todos. Não confunda o stub local com dados reais.
6. Use Desativar métricas e confira recarga, preferência persistida e ausência de novos disparos. Teste também uma recusa válida herdada da versão anterior. Confira relatórios processados depois do período de processamento do serviço.
7. Para desligar o portal, defina `analytics.enabled` como `false` em `config.json` e publique novo build. O QA estrutural suporta o estado desligado.
- Dados agregados medidos não cobrem todos os visitantes. Recusas, bloqueadores, testes próprios e baixo tráfego devem constar nas limitações do case.

## Fontes oficiais
- https://support.google.com/analytics/answer/9304153?hl=pt-BR
- https://support.google.com/analytics/answer/9322688?hl=pt-BR
- https://support.google.com/analytics/answer/6366371?hl=pt-BR

- https://developers.google.com/tag-platform/security/guides/consent
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
