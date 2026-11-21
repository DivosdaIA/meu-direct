# Regras da Meta e limites do Zernio

Conferido em 21/11/2026. Fonte em cada item.

## Zernio: quanto custa

- **2 contas conectadas grátis**, sem cartão. Da 3ª à 10ª: US$ 6 por conta por mês. (docs.zernio.com/pricing/social)
- **Instagram e Página do Facebook contam como 2 contas.**
- **10.000 mensagens enviadas por mês grátis**; depois, US$ 1 a cada 10.000. Comentários e mensagens recebidas não contam. (docs.zernio.com/pricing/inbox)
- **2.000 execuções de automação por mês grátis** (cada DM enviada = 1); depois, US$ 2 a cada 1.000. **A partir de 01/12/2026, sem cartão cadastrado, as automações pausam quando chegam a 2.000 no mês.** (docs.zernio.com/pricing/automations)
- Todos os recursos estão incluídos no grátis: não existe plano "pro". (docs.zernio.com/pricing)

## Conta

- Precisa ser **profissional** (Comercial ou Criador de conteúdo). (docs.zernio.com/platforms/instagram)
- **Não precisa de Página do Facebook**: o login pelo Instagram basta. A Página só é necessária para anúncios e para curtir comentário automaticamente.
- O Zernio renova o acesso ao Instagram sozinho. Se não conseguir, a conta aparece como "precisa reconectar" e as automações param até reconectar. Reconectar mantém tudo. (docs.zernio.com/webhooks/accounts/account-disconnected)

## Regras da Meta

- **Uma resposta privada por comentário**, em até **7 dias** do comentário. A próxima mensagem só depois que a pessoa responder, e em até 24 horas. (developers.facebook.com/docs/instagram-platform/private-replies)
- **Janela de 24 horas**: depois que a pessoa manda mensagem ou toca num botão, a automação pode responder por 24 horas. (developers.facebook.com/docs/messenger-platform/policy/policy-overview)
- **Saber se a pessoa segue** só é possível depois que ela manda mensagem, toca num botão ou numa pergunta de abertura. Comentar não basta. (developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/user-profile)
- **Para quem não segue**, o Instagram pode recusar DM automática com botão, cartão ou imagem, e ainda gastar a única resposta daquele comentário. Por isso o "só para seguidores" e o "toque para liberar" mandam primeiro um texto com botão de confirmação, que o Zernio trata do jeito certo. (docs.zernio.com/comments/send-private-reply-to-comment)
- **Limites oficiais por conta profissional**: 750 respostas privadas por hora em post e reels; 100 mensagens por segundo. O "200 DMs por hora" que circula por aí não aparece na documentação oficial. (developers.facebook.com/docs/instagram-platform/overview)
- **Quem começa a conversa é sempre a pessoa.** Não dá para mandar DM para quem nunca interagiu.

## Boas práticas para não parecer spam

- 3 a 6 versões diferentes da resposta pública; nada de resposta só com emoji.
- Mais de uma versão da DM quando o post viraliza.
- Palavra-chave clara no post, e ninguém recebe a mesma DM duas vezes (o padrão "uma vez por pessoa" já cuida disso).
