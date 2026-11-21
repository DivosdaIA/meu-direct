# Meu Direct

**O seu próprio ManyChat para Instagram, de graça, montado pelo Claude.**

Quem comenta a palavra-chave no seu post recebe a mensagem na DM na hora. Quem responde o seu story, te marca ou manda a palavra no direct também recebe. Tudo pela API oficial do Instagram, usando o [Zernio](https://zernio.com), num painel com o seu nome, o seu logo e as suas cores.

- Resposta pública automática embaixo do comentário (até 6 frases, sorteadas)
- DM com o primeiro nome da pessoa e até 3 botões com link
- **Só para seguidores**: quem não segue recebe primeiro o pedido para seguir
- Resposta a story, menção no story, comentário na live e palavra no direct
- Perguntas de abertura do direct
- Histórico de quem recebeu, com o motivo de quem não recebeu
- Várias contas no mesmo painel (para quem atende clientes)

As automações rodam no Zernio, 24 horas por dia, **mesmo com o seu computador desligado**. O painel roda no seu computador e serve para criar e editar.

> Material da aula "Seu próprio ManyChat" do **Clube Divos da IA**. O passo a passo completo, com vídeos, está na aula.

---

## O que você precisa

1. **Claude Code** instalado.
2. **Instagram profissional** (Comercial ou Criador de conteúdo). Conta pessoal não funciona.
3. **Conta no Zernio** com o seu Instagram conectado. É grátis até 2 contas conectadas. A skill te guia se você ainda não tiver.
4. Um **segundo perfil** do Instagram para testar (comentar com a própria conta não dispara).

Você **não** precisa de conta no GitHub.

---

## Instalar

Abra o Claude Code e cole:

```
Instala a skill meu-direct do repositório github.com/DivosdaIA/meu-direct.
Lê o README de lá e segue a parte "Para o Claude". No fim, me mostra que a
skill /meu-direct está instalada.
```

Depois, para montar o seu painel:

```
/meu-direct
```

A skill pergunta uma coisa por vez (nome do painel, logo, cores), monta o painel, abre no navegador e cria a primeira automação junto com você.

## Abrir o painel depois

```
abre meu painel de automações
```

Ou dois cliques no arquivo `abrir-painel` dentro da pasta `meu-direct`.

## Atualizar

Quando sair uma versão nova:

```
Atualiza a minha skill meu-direct pelo repositório github.com/DivosdaIA/meu-direct.
```

A sua marca e as suas automações continuam como estão.

---

## Importante

- **A chave do Zernio é uma senha.** Você cola na tela do painel, nunca em grupo, print ou mensagem. Ela fica só no seu computador, no arquivo `.env` da pasta do painel.
- **Instagram e Página do Facebook contam como 2 contas** no Zernio. Da 3ª conta em diante, US$ 6 por conta por mês.
- A automação só responde comentários feitos **depois** de ligada, e o Instagram só deixa uma resposta automática por comentário, em até 7 dias.
- O painel abre só no seu computador (`127.0.0.1`). Por isso não tem login: ninguém de fora consegue acessar.

---

## Para o Claude

Passos técnicos da instalação (a pessoa não digita nada disso):

1. Baixe `https://github.com/DivosdaIA/meu-direct/archive/refs/heads/main.zip` para uma pasta temporária e descompacte (no Mac: `curl -L -o` e `unzip`; no Windows: `curl.exe -L -o` e `tar -xf`). Não precisa de git nem de conta no GitHub.
2. Crie `~/.claude/skills` se não existir (no Windows, `%USERPROFILE%\.claude\skills`).
3. Copie a pasta `meu-direct-main/skills/meu-direct` inteira para `~/.claude/skills/meu-direct`, mantendo `molde/` e `referencias/`. Se já existir uma versão, substitua e avise.
4. Confira que existem `SKILL.md`, `molde/servidor.mjs`, `molde/index.html` e os 3 arquivos de `referencias/`.
5. Confira o Node (`node -v`, precisa ser 18 ou mais). Se faltar, instale (Mac com Homebrew: `brew install node`; senão, o instalador LTS de nodejs.org).
6. Apague a pasta temporária e diga: "Pronto. Agora digita /meu-direct que a gente monta o seu painel."
