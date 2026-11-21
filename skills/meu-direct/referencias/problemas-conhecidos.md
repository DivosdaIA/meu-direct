# Problemas conhecidos (na ordem em que conferir)

## O painel não abre

- **"command not found: node"**: o Node não está instalado. Instale (Etapa 1 da skill).
- **A página não carrega**: o servidor não está rodando. Rode `node servidor.mjs` na pasta do painel e abra o endereço que ele mostrar (pode ser 4322, 4323... se a 4321 estiver ocupada).
- **Fechou o terminal e o painel parou**: é normal. O painel só roda enquanto o servidor está aberto. As automações não param: elas rodam no Zernio.

## Não consigo conectar

- **"A chave do Zernio não foi aceita"**: a chave foi copiada pela metade ou apagada. Crie outra em Settings → API Keys.
- **"Não achei nenhum Instagram conectado"**: o Instagram não foi conectado no Zernio, ou foi conectado em outra conta do Zernio. Connections → New Connection → Instagram.
- **"O Zernio pediu cartão"**: já existem 2 contas conectadas (lembre que Instagram + Página do Facebook = 2). Desconecte a que não usa ou cadastre o cartão.

## A automação não respondeu

Confira nesta ordem:

1. **Comentou com a própria conta?** Não dispara. Teste com outro perfil.
2. **O comentário foi feito antes de ligar a automação?** Não dispara, nunca. Comente de novo.
3. **A automação está ligada?** A chave verde na lista.
4. **A palavra bate?** Abra o Histórico: se aparecer "comentários não tinham a palavra-chave" com o exemplo, a pessoa escreveu diferente. Acrescente a palavra ou troque "Palavra inteira" por "Contém".
5. **O post é o certo?** Se escolheu um post específico, só aquele dispara.
6. **Já recebeu antes?** Com "uma vez por pessoa", o mesmo perfil não recebe de novo da mesma automação. No Histórico aparece "pulada". Para testar de novo, use outro perfil ou mude para "a cada novo comentário".
7. **Existe outra automação ligada no mesmo post?** Só pode uma por post.
8. **Esperou?** Normalmente chega em segundos. Se o aviso do Instagram atrasar, o Zernio confere os comentários a cada 10 minutos e manda os que faltaram.
9. **A conexão caiu?** Se o painel mostrar "A conexão do Instagram com o Zernio caiu", reconecte no Zernio.

## Chegou o pedido para seguir, mas depois de seguir não chega o link

- A pessoa precisa **tocar no botão** depois de seguir. Seguir sem tocar não avisa ninguém.
- Logo depois de seguir, o Instagram às vezes demora alguns segundos para atualizar. Se chegar "ainda não apareceu que você me segue", espere uns 20 segundos e toque de novo.
- No Histórico, "esperando o toque" quer dizer que o pedido foi e a pessoa ainda não tocou.

## A DM falhou (Histórico: "falhou")

- **"privateReplyConsumed"** ou erro 1545133: o Instagram recusou a DM com botão ou imagem para quem não segue, e a resposta daquele comentário se perdeu. Ligue "só para seguidores" ou "toque para liberar".
- **Limite da Meta (613)**: muitos envios numa hora. Nada se perdeu; o envio pode ser tentado de novo.
- **Imagem não chegou** (`mediaError`): o Instagram às vezes só aceita a imagem depois que a pessoa responde. A mensagem principal chegou mesmo assim.

## Curtir comentário não funciona

É esperado: no Instagram, curtir automaticamente ainda está em teste e só vale para contas conectadas pelo Facebook e liberadas pela Meta. O resto da automação funciona normalmente.
