# API do Zernio: o que o painel usa e o que dá para ir além

Base: `https://zernio.com/api/v1` · Cabeçalho: `Authorization: Bearer <chave>` · Documentação: https://docs.zernio.com
Conferido em 21/11/2026.

## O que o painel usa

| Para quê | Chamada |
|---|---|
| Testar a chave e listar o Instagram conectado | `GET /accounts?platform=instagram` (cada conta traz `_id`, `profileId`, `username`) |
| Listar os posts (para escolher o post) | `GET /accounts/{accountId}/posts?limit=24` → `posts[].id`, `picture`, `message` |
| Listar automações | `GET /comment-automations?profileId=...` |
| Criar | `POST /comment-automations` |
| Editar, ligar ou desligar | `PATCH /comment-automations/{id}` (ex.: `{ "isActive": false }`) |
| Apagar | `DELETE /comment-automations/{id}` |
| Histórico de envios | `GET /comment-automations/{id}/logs` |
| Perguntas de abertura | `GET`, `PUT` e `DELETE /accounts/{accountId}/instagram-ice-breakers` (até 4, 80 caracteres) |

## Campos da automação (POST /comment-automations)

| Campo | O que é | No painel |
|---|---|---|
| `profileId`, `accountId` | De qual conta | o servidor preenche |
| `name` | Nome interno | Ajustes finais |
| `trigger` | `comment`, `story_reply`, `story_mention`, `live_comment` | Passo 1 |
| `platformPostId` | ID do post (vem de `/accounts/{id}/posts`, **não** o número do link do Instagram). Sem ele: todos os posts | Passo 2 |
| `keywords` + `matchMode` | Palavras e como comparar: `word` (palavra inteira), `contains`, `exact`. Vazio = qualquer comentário | Passo 3 |
| `typoTolerance` | Aceita erro de digitação (só com `word`, palavras de 4+ letras) | Passo 3 |
| `excludeKeywords` | Palavras que bloqueiam | Passo 3 |
| `commentReply` + `commentReplyVariations` (até 5) | Resposta pública e variações sorteadas | Responder no comentário |
| `publicReplyPolicy` | `after_dm` (padrão: só depois da DM) ou `always` | Responder no comentário |
| `audience` | `{ followerStatus: "follower", whenUnknown: "verify" }` = só seguidores; `{ tapToUnlock: true }` = toque antes | Só para seguidores |
| `followGate` | `message`, `buttonLabel` (20), `profileButtonLabel` (20), `notFollowingMessage` | Só para seguidores |
| `dmMessage` + `dmMessageVariations` (até 5) | A DM. 640 caracteres com botão, ~1000 sem | A mensagem na DM |
| `buttons` | Até 3: `{ type: "url", title (20), url }` | A mensagem na DM |
| `dmMedia` | `{ type: "image", url }`, vai como segunda mensagem | A mensagem na DM |
| `dmDelaySeconds` | Espera antes de mandar (até 86400) | Ajustes finais |
| `repeatPolicy` | `{ mode: "once" }` ou `{ mode: "every_comment", cooldownHours }` | Ajustes finais |
| `alsoMatchInDms` | Também responde quem manda a palavra na DM (precisa de palavra) | Ajustes finais |
| `actions` | `{ hideComment, likeComment }` (curtir: só contas conectadas pelo Facebook e liberadas pela Meta) | Ajustes finais |
| `isActive` | `false` cria desligada | Salvar desligada |
| `quickReplies`, `template` (cartão de produto), `linkTracking`, `clickTag` | Não estão no painel | pedir ao Claude |

Personalização nos textos: `{{first_name}}`, `{{name}}`, `{{username}}`.

## Para ir além: Workflows (fluxos com várias etapas)

`POST /workflows` com `nodes` e `edges`, depois `POST /workflows/{id}/activate`. Gatilhos: `comment`, `inbound_message`, `referral` (link ig.me com `?ref=`), `story_mention`, `reaction`. Blocos: `send_message`, `wait_for_reply` (com `timeoutMinutes` e `saveAs`), `add_tag`, condição, `end`. Exemplos prontos: https://docs.zernio.com/guides/manychat-patterns

Um botão de uma automação de comentário pode continuar num workflow: `{ "type": "postback", "title": "Quero", "payload": "zernio:workflow:<workflowId>" }`.

## Erros que aparecem

| Erro | Quer dizer |
|---|---|
| 401 `invalid_credentials` | Chave errada, apagada ou incompleta |
| 401 `TOKEN_EXPIRED` | A conexão com o Instagram caiu: reconectar no Zernio |
| 402 `free_tier_exceeded` | Passou de 2 contas sem cartão |
| 403 `message_allowance_exceeded` | Passou das 10.000 mensagens grátis do mês sem cartão |
| 409 | Já existe automação ligada nesse post |
| 400 com `param` | O campo citado está errado |
| 429 | Muitas chamadas: esperar |
