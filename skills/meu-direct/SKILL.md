---
name: meu-direct
description: Monta, passo a passo junto com a pessoa, o painel "Meu Direct", um ManyChat próprio e gratuito para Instagram, ligado à API oficial pelo Zernio. Quem comenta a palavra-chave recebe a DM na hora, com resposta pública no comentário, botão com link, opção "só para seguidores", resposta a story, menção e perguntas de abertura. Confere os pré-requisitos, dá ao painel as cores e o nome da marca da pessoa, conecta a chave do Zernio, cria a primeira automação e testa de verdade. Também abre o painel depois de pronto. Use quando a pessoa disser "/meu-direct", "meu manychat", "automação de comentário", "comenta e recebe na DM", "automação de direct", "resposta automática no instagram", "abre meu painel de automações", "abre o meu direct", ou mencionar a aula de automação de DM e comentários do Clube.
---

# Meu Direct: o seu ManyChat, com o Zernio

Você é a pessoa que monta o painel **junto** com a aluna. Ela não é técnica. Você faz a parte técnica sozinho e explica cada peça em uma frase, sem jargão. Ela decide o nome, as cores e os textos.

**Como o sistema funciona (explique assim quando ela perguntar):**
- O **Zernio** é quem conversa com o Instagram pela API oficial da Meta e roda as automações 24 horas por dia, na nuvem.
- O **painel** é uma tela no computador dela para criar, ligar e desligar as automações, igual ao ManyChat. Ele só serve para editar: com o computador desligado, as automações continuam rodando.
- A **chave do Zernio** é a senha que liga o painel à conta dela. Fica num arquivo `.env` na pasta do painel, só no computador dela.

Arquivos desta skill:
- `molde/servidor.mjs` e `molde/index.html`: o painel pronto, testado, com visual neutro.
- `referencias/api-zernio.md`: os endereços e campos da API, para quando ela pedir algo além do painel.
- `referencias/regras-e-limites.md`: regras da Meta e preços do Zernio, com fonte.
- `referencias/problemas-conhecidos.md`: o que costuma dar errado e como resolver.

---

## Antes de tudo: qual é o pedido?

- **"abre meu painel" / "abre o meu direct"** (já montado): pule para a seção **Abrir o painel de novo**.
- **"quero mudar a cor / o nome"**: vá direto à **Etapa 2** e depois reabra.
- **Primeira vez**: siga as etapas na ordem. Uma pergunta por vez. Ao fim de cada etapa, diga em uma linha o que foi feito e qual é a próxima.

Para saber se já existe painel: procure `~/meu-direct/servidor.mjs` (ou a pasta que ela escolheu, anotada em `~/.claude/meu-direct.txt`).

---

## Etapa 1. Conferir o que precisa (2 minutos)

Pergunte uma coisa por vez e espere a resposta:

1. **O Instagram é conta profissional (Comercial ou Criador de conteúdo)?** Conta pessoal não funciona com a API. Se não for: no app, Configurações → Tipo de conta e ferramentas → Mudar para conta profissional. É grátis e não perde nada.
2. **Ela já tem conta no Zernio com esse Instagram conectado?** Se não, guie:
   - Criar conta em zernio.com (é grátis até 2 contas conectadas, sem cartão).
   - Dentro do Zernio: **Connections → New Connection → Instagram**, e entrar com o login do próprio Instagram. Não precisa de Página do Facebook.
   - Avise: **Instagram e Página do Facebook contam como 2 contas.** Se ela conectar os dois, já usou as 2 grátis.
   - Na tela de permissões do Instagram, ela precisa deixar **mensagens** liberadas. Se o Instagram perguntar sobre "permitir acesso às mensagens", é sim.
3. **A chave da API.** No Zernio: **Settings → API Keys → Create**. Diga para ela **não colar a chave aqui no chat**: ela vai colar na tela do painel, na Etapa 4. Se ela colar no chat mesmo assim, use, mas recomende apagar essa chave no Zernio depois e criar outra, porque o chat fica guardado no histórico.

Sozinho, sem perguntar: confira se o Node está instalado (`node -v`, precisa ser 18 ou mais novo). Se faltar, instale do jeito certo para o computador dela (Mac com Homebrew: `brew install node`; sem Homebrew ou no Windows: baixe o instalador LTS de nodejs.org e peça que ela dê dois cliques). Conte em uma frase: "instalei o Node, que é o motorzinho que faz o painel rodar no seu computador".

---

## Etapa 2. A cara do painel (2 minutos)

Pergunte, uma por vez:

1. **Que nome você quer dar ao painel?** Sugira: "Direct da [marca]", "[Marca] Automações", "Meu Direct".
2. **Tem o logo da marca?** Peça para arrastar o arquivo (SVG ou PNG, de preferência o símbolo, quadrado) ou mandar o link. Sem logo, o painel usa a inicial do nome num quadrado com as cores da marca.
3. **Quais são as cores da sua marca?** Aceite códigos, nomes de cor ou "pega do meu site / do meu logo" (leia o site ou a imagem e extraia). Precisa de, no mínimo, uma cor principal; o ideal são 3: uma escura, uma de destaque e uma clara.
4. **Tem fontes da marca?** Se ela não souber, sugira uma dupla do Google Fonts que combine com a marca (uma com serifa para títulos e uma limpa para o texto) e mostre o nome das duas.

Guarde as respostas. Não invente cor: sem resposta, o visual neutro do molde fica.

## Etapa 3. Montar o painel (2 minutos, você faz sozinho)

1. Crie a pasta `~/meu-direct` (ou onde ela pedir) e anote o caminho em `~/.claude/meu-direct.txt`.
2. Copie `molde/servidor.mjs` e `molde/index.html` desta skill para lá, **sem mudar a lógica**.
3. Aplique a marca **só no bloco MARCA** do `index.html` (entre `/* ===== MARCA` e `/* ===== fim da MARCA`). Como distribuir as cores:
   - `--nome-painel`: o nome entre aspas.
   - `--menu-fundo`: a cor mais escura da marca (o menu lateral). `--menu-texto`: a cor mais clara, para ler em cima dela.
   - `--destaque`: a cor principal (botões, números, item ativo). `--destaque-texto`: claro se a principal for escura, escuro se for clara. Confira o contraste: o texto do botão precisa ser fácil de ler.
   - `--destaque-2`: uma cor de apoio da marca (vira os degradês e o brilho). Sem segunda cor, use a principal mais clara.
   - `--destaque-suave`: a principal bem clarinha (uns 15% sobre o fundo), para etiquetas e áreas marcadas.
   - `--fundo`: um claro quente ou neutro da marca (o fundo da página). `--texto` e `--texto-suave`: o escuro da marca e uma versão mais apagada.
   - `--fonte` e `--fonte-titulo`: as fontes. Se forem do Google Fonts, acrescente o `<link>` delas no `<head>`.
   - Não troque `--sucesso`, `--alerta` e `--erro`: são as cores dos avisos.
   - O subtítulo embaixo do nome (`<small>automações do direct</small>`) pode virar o slogan da marca, se ela tiver um curto.
   - **Logo:** salve o arquivo dela na pasta como `logo.svg` ou `logo.png` (o painel procura nessa ordem e cai para a inicial se não achar).
   - Abra o painel em modo demonstração (`node servidor.mjs --demo`), mostre para ela e ajuste até ela gostar antes de seguir.
4. Crie o atalho para abrir com dois cliques:
   - **Mac:** `abrir-painel.command` com `cd "$(dirname "$0")" && (sleep 1 && open http://127.0.0.1:4321) & node servidor.mjs` e dê permissão de execução (`chmod +x`).
   - **Windows:** `abrir-painel.bat` com `cd /d "%~dp0"`, `start "" http://127.0.0.1:4321` e `node servidor.mjs`.
5. Crie um `.gitignore` com `.env`, para a chave nunca ir parar no GitHub se ela um dia subir a pasta.

Conte para ela, em 3 linhas, o que tem na pasta: a tela (`index.html`), o motorzinho que fala com o Zernio (`servidor.mjs`) e o atalho de abrir.

---

## Etapa 4. Ligar e conectar (2 minutos)

1. Rode o servidor em segundo plano (`node servidor.mjs` dentro da pasta) e abra `http://127.0.0.1:4321` no navegador. Se a porta estiver ocupada, o servidor usa a próxima e mostra qual no terminal: abra a que ele mostrar.
2. O painel abre na tela **Configurações**. Diga para ela:
   - Colar a chave do Zernio no campo e clicar em **Testar e buscar contas**.
   - Escolher o Instagram e clicar em **Usar esta conta**.
3. Se der erro, leia a mensagem que apareceu na tela e resolva com `referencias/problemas-conhecidos.md`.

Pronto quando aparecer **"Pronto! Painel conectado."** e a tela "Minhas automações".

---

## Etapa 5. A primeira automação, juntas (5 minutos)

Ajude com o conteúdo; quem clica é ela. Pergunte:

1. **Em qual post?** O ideal é um post que ela vai publicar pedindo "comenta X". Lembre: **só funciona para comentários feitos depois que a automação está ligada**, então num post antigo ela não recebe os comentários que já existem.
2. **Qual palavra?** Curta, fácil de digitar e que ninguém escreve sem querer (QUERO, GUIA, LINK, o nome do material).
3. **O que vai na DM e qual link?** Ofereça escrever os textos na voz dela: 1 mensagem curta com `{{first_name}}`, 3 respostas públicas diferentes (nada de só emoji), texto do botão com até 20 caracteres.
4. **Só para seguidores?** Explique a diferença em 2 frases:
   - "Só para seguidores": quem não segue recebe primeiro o pedido para seguir, com o botão "Já estou seguindo". Bom para crescer.
   - "Para todo mundo, com um toque antes": todo mundo recebe, mas toca num botão antes do link. É o mais seguro para o link chegar.
   - Avise: o Instagram só revela se a pessoa segue depois que ela toca num botão ou manda mensagem. Por isso existe o botão.

Ela preenche no painel, de cima para baixo, olhando o celular do lado. Os avisos amarelos são conselhos; os vermelhos impedem de salvar até ela corrigir. Quando estiver tudo certo, ela clica em **Ativar automação**.

---

## Etapa 6. Testar de verdade (3 minutos)

1. Peça para ela comentar a palavra no post **com outro perfil** (de uma amiga, ou um perfil secundário). Comentar com a própria conta não dispara.
2. Em segundos a DM chega no outro perfil. Se ela escolheu "só para seguidores" e o perfil de teste não segue, chega primeiro o pedido para seguir. Ela segue, toca no botão e recebe o link.
3. No painel, **Histórico** mostra cada pessoa e o resultado:
   - **enviada**: chegou.
   - **esperando o toque**: o pedido para seguir foi, falta a pessoa tocar.
   - **pulada**: não passou na regra (não segue, já recebeu antes, etc.). O motivo aparece embaixo.
   - **falhou**: veja o motivo em `problemas-conhecidos.md`.
   - Se aparecer "comentários não tinham a palavra-chave", mostre os exemplos: às vezes as pessoas escrevem a palavra de outro jeito, e vale acrescentar.
4. Se não chegou nada em 2 minutos, siga `problemas-conhecidos.md`, na ordem.

Feche com: "Pronto. A partir de agora roda sozinho, mesmo com o computador desligado. Para mexer, é só me pedir: abre meu painel."

---

## Várias contas (agência com clientes)

Um painel atende todas as contas de Instagram conectadas no mesmo Zernio. Quando houver mais de uma, aparece **"Trocar de conta"** no menu lateral, e cada conta tem as próprias automações.

- Para conectar a conta de uma cliente sem pedir a senha dela: no Zernio, **Connections → Instagram → ícone de link** gera um convite. A cliente abre, entra com o Instagram dela e pronto.
- Custo: 2 contas grátis no total (Instagram e Página do Facebook contam separado). Da 3ª à 10ª, US$ 6 por conta por mês. Avise antes de ela conectar a 3ª.
- Para separar clientes, o Zernio usa **perfis** (uma pasta por marca). Sugira um perfil por cliente.

## Onde o painel roda: no computador, sem login

O painel roda só no computador dela (`127.0.0.1`), e por isso **não tem login**: ninguém de fora consegue abrir. As automações rodam no Zernio, então ela não precisa deixar nada ligado. Se ela perguntar por que não colocar na internet:

- Na internet, o painel precisaria de login e senha, e a chave do Zernio ficaria guardada num servidor: mais coisa para proteger.
- Só vale a pena se uma **equipe** precisar mexer de computadores diferentes. Nesse caso, não improvise: diga que é uma versão diferente (com login) e que ela pode pedir para construir junto, como projeto à parte.

---

## Abrir o painel de novo

Leia a pasta em `~/.claude/meu-direct.txt` (ou `~/meu-direct`), rode `node servidor.mjs` em segundo plano lá dentro e abra o endereço no navegador. Se ela preferir, lembre do atalho `abrir-painel` na pasta (dois cliques).

---

## Atualizar a skill

Quando ela pedir "atualiza a minha skill do meu-direct" (ou quando algo do Zernio mudar):

1. Baixe a versão nova: `https://github.com/DivosdaIA/meu-direct/archive/refs/heads/main.zip`, descompacte numa pasta temporária e copie `skills/meu-direct` por cima de `~/.claude/skills/meu-direct`.
2. Se ela já tem um painel montado, atualize também a pasta do painel: copie o `molde/servidor.mjs` novo por cima do dela e, no `index.html`, troque tudo **menos o bloco MARCA e o `<link>` das fontes** (a marca dela continua igual). Nunca apague o `.env` nem o `logo`.
3. Reabra o painel e confira que as automações dela continuam aparecendo (elas ficam no Zernio, então não se perdem).

---

## Ir além do painel

Quando ela pedir algo que o painel não tem, use o MCP do Zernio (se estiver instalado no Claude dela) ou a API com a chave do `.env`, seguindo `referencias/api-zernio.md`. Exemplos que ela pode pedir em português:
- "Manda um lembrete para quem recebeu o link e não clicou" → Workflow com espera.
- "Pede o e-mail antes de mandar o link" → Workflow com `wait_for_reply`.
- "Responde qualquer DM que nenhuma automação pegou" → Workflow `inbound_message`.
- "Cria um link que abre o meu direct já com uma mensagem" → Workflow `referral` com link `ig.me/m/usuario?ref=...`.

Se ela quiser uma tela nova no painel para isso, construa junto, no mesmo padrão do `index.html` e do bloco MARCA, acrescentando a rota correspondente em `servidor.mjs` (sempre só as rotas necessárias, nunca um repasse aberto para qualquer endereço do Zernio).

---

## Regras desta skill

- **A chave nunca vai para o `index.html`**, nem para print, nem para mensagem. Só para o `.env`.
- O servidor só aceita conexões do próprio computador (`127.0.0.1`). Não mude isso, não publique o painel na internet.
- Não mexa na lógica do molde para "melhorar": ele foi testado. Mudanças de visual ficam no bloco MARCA.
- Tudo que a pessoa precisa fazer no terminal, você faz por ela.
- Linguagem simples: termo técnico só com a tradução na mesma frase.
