// Meu Direct: servidor local do painel de automacoes do Instagram (via Zernio).
// Sem dependencias: precisa so do Node 18 ou mais novo.
// Roda em http://127.0.0.1:PORTA e so aceita conexoes do proprio computador.
// A chave do Zernio fica no arquivo .env desta pasta e nunca vai para o navegador.
//
// Uso:   node servidor.mjs            (modo normal, fala com o Zernio)
//        node servidor.mjs --demo     (modo demonstracao, dados de exemplo, nao chama nada)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
const ARQ_ENV = path.join(PASTA, '.env');
const API = 'https://zernio.com/api/v1';
const DEMO = process.argv.includes('--demo') || process.env.DEMO === '1';
const PORTA_INICIAL = Number(process.env.PORTA || 4321);

// ---------- .env ----------
function lerEnv() {
  const env = {};
  if (!fs.existsSync(ARQ_ENV)) return env;
  for (const linha of fs.readFileSync(ARQ_ENV, 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return env;
}
function salvarEnv(novos) {
  const env = { ...lerEnv(), ...novos };
  const texto = Object.entries(env).filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  fs.writeFileSync(ARQ_ENV, texto, { mode: 0o600 });
  try { fs.chmodSync(ARQ_ENV, 0o600); } catch {}
}

// ---------- chamada ao Zernio ----------
async function zernio(metodo, caminho, corpo, chave) {
  const key = chave || lerEnv().ZERNIO_API_KEY;
  if (!key) return { status: 401, json: { error: 'Falta a chave do Zernio. Abra Configuracoes e cole a chave.' } };
  const r = await fetch(API + caminho, {
    method: metodo,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  let json = null;
  const texto = await r.text();
  try { json = texto ? JSON.parse(texto) : {}; } catch { json = { error: texto.slice(0, 300) }; }
  return { status: r.status, json };
}

const idDe = (o) => o?._id || o?.id;
const perfilDe = (a) => (typeof a?.profileId === 'object' ? idDe(a.profileId) : a?.profileId);

// ---------- dados de demonstracao ----------
const DEMO_CONTAS = [
  { id: 'demo-conta', profileId: 'demo-perfil', username: 'sua.marca', displayName: 'Sua Marca' },
  { id: 'demo-cliente-1', profileId: 'demo-perfil-2', username: 'doceria.lua', displayName: 'Doceria Lua (cliente)' },
  { id: 'demo-cliente-2', profileId: 'demo-perfil-3', username: 'studio.bela', displayName: 'Studio Bela (cliente)' },
];
const demo = {
  conta: DEMO_CONTAS[0],
  posts: Array.from({ length: 9 }, (_, i) => ({
    id: `1790000000000${i}`,
    message: ['3 prompts que eu uso todo dia. comenta QUERO que eu te mando', 'o guia gratuito saiu! comenta GUIA', 'bastidores da semana', 'como eu organizo meu conteudo', 'a ferramenta que mudou meu mes', 'pergunta da caixinha', 'antes e depois', 'aula nova no ar', 'meu setup'][i],
    picture: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="hsl(${i * 37},35%,${70 - i * 2}%)"/><text x="150" y="165" font-family="sans-serif" font-size="44" text-anchor="middle" fill="#fff">post ${i + 1}</text></svg>`)}`,
    mediaType: i % 3 === 0 ? 'REELS' : 'IMAGE',
    commentCount: 40 - i * 3,
    createdTime: new Date(Date.now() - i * 86400000).toISOString(),
  })),
  automacoes: [],
  perguntas: [{ question: 'Quero o guia gratuito' }, { question: 'Como funciona a mentoria?' }],
};
demo.automacoes.push({
  id: 'demo-1', accountId: 'demo-conta', name: 'Guia gratuito', platform: 'instagram', trigger: 'comment',
  platformPostId: demo.posts[1].id, postTitle: demo.posts[1].message, keywords: ['guia'], matchMode: 'word',
  dmMessage: 'Oi {{first_name}}! Aqui esta o seu guia:', buttons: [{ type: 'url', title: 'Baixar o guia', url: 'https://exemplo.com/guia' }],
  commentReply: 'Te mandei na DM, {{first_name}}!', commentReplyVariations: ['Olha a sua DM!', 'Enviado, confere o direct'],
  audience: { followerStatus: 'follower', whenUnknown: 'verify' },
  followGate: { message: 'Quase la! O guia e so para quem me segue. Me segue e toca no botao abaixo', buttonLabel: 'Ja estou seguindo' },
  isActive: true, stats: { triggered: 128, dmsSent: 121, dmsFailed: 2, linkClicks: 87 }, createdAt: new Date().toISOString(),
});
const demoLogs = [
  { commenterUsername: 'maria.cria', commentText: 'GUIA', status: 'sent', audienceOutcome: 'gate_passed', clickCount: 1, createdAt: new Date().toISOString() },
  { commenterUsername: 'ana.social', commentText: 'quero o guia', status: 'gated', audienceOutcome: 'gate_sent', clickCount: 0, createdAt: new Date().toISOString() },
  { commenterUsername: 'bia.agencia', commentText: 'guia por favor', status: 'skipped', error: 'not a follower', audienceOutcome: 'blocked', createdAt: new Date().toISOString() },
];

// ---------- rotas do painel ----------
async function rotear(req, url, corpo) {
  const env = lerEnv();
  const conta = () => ({ accountId: env.ZERNIO_ACCOUNT_ID, profileId: env.ZERNIO_PROFILE_ID });
  const p = url.pathname;
  const m = (re) => p.match(re);

  if (p === '/api/estado' && req.method === 'GET') {
    if (DEMO) return { status: 200, json: { demo: true, configurado: true, conta: demo.conta } };
    return { status: 200, json: { demo: false, configurado: !!(env.ZERNIO_API_KEY && env.ZERNIO_ACCOUNT_ID), temChave: !!env.ZERNIO_API_KEY,
      conta: env.ZERNIO_ACCOUNT_ID ? { id: env.ZERNIO_ACCOUNT_ID, profileId: env.ZERNIO_PROFILE_ID, username: env.ZERNIO_USERNAME } : null } };
  }

  // lista as contas de Instagram conectadas (para trocar de conta: agencia com varios clientes)
  if (p === '/api/contas' && req.method === 'GET') {
    if (DEMO) return { status: 200, json: { contas: DEMO_CONTAS, ativa: demo.conta.id } };
    const r = await zernio('GET', '/accounts?platform=instagram');
    if (r.status !== 200) return r;
    const contas = (r.json.accounts || []).map((a) => ({ id: idDe(a), profileId: perfilDe(a), username: a.username, displayName: a.displayName, foto: a.profilePicture || a.profilePictureUrl }));
    return { status: 200, json: { contas, ativa: env.ZERNIO_ACCOUNT_ID || null } };
  }

  // 1) testa a chave e lista as contas de Instagram conectadas no Zernio
  if (p === '/api/contas' && req.method === 'POST') {
    if (DEMO) return { status: 200, json: { contas: DEMO_CONTAS } };
    const chave = (corpo?.apiKey || env.ZERNIO_API_KEY || '').trim();
    if (!chave) return { status: 400, json: { error: 'Cole a chave do Zernio.' } };
    const r = await zernio('GET', '/accounts?platform=instagram', null, chave);
    if (r.status !== 200) return r;
    if (corpo?.apiKey) salvarEnv({ ZERNIO_API_KEY: chave });
    const contas = (r.json.accounts || []).map((a) => ({ id: idDe(a), profileId: perfilDe(a), username: a.username, displayName: a.displayName, foto: a.profilePicture || a.profilePictureUrl }));
    return { status: 200, json: { contas } };
  }

  // 2) escolhe a conta que o painel vai usar
  if (p === '/api/conta' && req.method === 'POST') {
    if (DEMO) { const c = DEMO_CONTAS.find((x) => x.id === corpo?.id); if (c) demo.conta = c; return { status: 200, json: { ok: true } }; }
    if (!corpo?.id) return { status: 400, json: { error: 'Escolha uma conta.' } };
    salvarEnv({ ZERNIO_ACCOUNT_ID: corpo.id, ZERNIO_PROFILE_ID: corpo.profileId || '', ZERNIO_USERNAME: corpo.username || '' });
    return { status: 200, json: { ok: true } };
  }

  // posts do Instagram (para escolher em qual post a automacao vale)
  if (p === '/api/posts' && req.method === 'GET') {
    if (DEMO) { const k = DEMO_CONTAS.findIndex((c) => c.id === demo.conta.id); return { status: 200, json: { posts: k ? demo.posts.map((x) => ({ ...x, picture: x.picture.replace(/hsl\((\d+)/, (m, h) => 'hsl(' + ((+h + k * 120) % 360)) })) : demo.posts } }; }
    const r = await zernio('GET', `/accounts/${conta().accountId}/posts?limit=24`);
    return r.status === 200 ? { status: 200, json: { posts: r.json.posts || [] } } : r;
  }

  // automacoes: listar e criar
  if (p === '/api/automacoes' && req.method === 'GET') {
    if (DEMO) return { status: 200, json: { automacoes: demo.automacoes.filter((a) => a.accountId === demo.conta.id) } };
    const r = await zernio('GET', `/comment-automations?profileId=${conta().profileId}`);
    if (r.status !== 200) return r;
    const lista = (r.json.automations || []).filter((a) => !a.accountId || a.accountId === conta().accountId);
    return { status: 200, json: { automacoes: lista } };
  }
  if (p === '/api/automacoes' && req.method === 'POST') {
    if (DEMO) { const a = { ...corpo, accountId: demo.conta.id, id: 'demo-' + Date.now(), platform: 'instagram', stats: { triggered: 0, dmsSent: 0, dmsFailed: 0 }, createdAt: new Date().toISOString() }; demo.automacoes.unshift(a); return { status: 200, json: { automation: a } }; }
    return zernio('POST', '/comment-automations', { ...corpo, ...conta() });
  }

  // automacao: editar, ligar/desligar, apagar, ver detalhes
  let r;
  if ((r = m(/^\/api\/automacoes\/([\w-]+)$/))) {
    const id = r[1];
    if (DEMO) {
      const i = demo.automacoes.findIndex((a) => a.id === id);
      if (req.method === 'PATCH' && i >= 0) { demo.automacoes[i] = { ...demo.automacoes[i], ...corpo }; return { status: 200, json: { automation: demo.automacoes[i] } }; }
      if (req.method === 'DELETE' && i >= 0) { demo.automacoes.splice(i, 1); return { status: 200, json: { success: true } }; }
      if (req.method === 'GET' && i >= 0) return { status: 200, json: { automation: demo.automacoes[i] } };
      return { status: 404, json: { error: 'Nao encontrei essa automacao.' } };
    }
    if (req.method === 'GET') return zernio('GET', `/comment-automations/${id}`);
    if (req.method === 'PATCH') return zernio('PATCH', `/comment-automations/${id}`, corpo);
    if (req.method === 'DELETE') return zernio('DELETE', `/comment-automations/${id}`);
  }
  if ((r = m(/^\/api\/automacoes\/([\w-]+)\/historico$/)) && req.method === 'GET') {
    if (DEMO) return { status: 200, json: { logs: demoLogs, misses: { total: 4, samples: [{ commentText: 'amei!!' }, { commentText: 'que lindo' }] } } };
    return zernio('GET', `/comment-automations/${r[1]}/logs?limit=50`);
  }

  // perguntas de abertura do direct (ice breakers)
  if (p === '/api/perguntas') {
    if (DEMO) { if (req.method === 'PUT') demo.perguntas = corpo.ice_breakers; return { status: 200, json: { data: demo.perguntas } }; }
    if (req.method === 'GET') return zernio('GET', `/accounts/${conta().accountId}/instagram-ice-breakers`);
    if (req.method === 'PUT') return zernio('PUT', `/accounts/${conta().accountId}/instagram-ice-breakers`, corpo);
    if (req.method === 'DELETE') return zernio('DELETE', `/accounts/${conta().accountId}/instagram-ice-breakers`);
  }

  return { status: 404, json: { error: 'Rota desconhecida: ' + p } };
}

// ---------- servidor http ----------
const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  // so aceita chamadas da propria pagina (protege a chave de outros sites)
  const host = (req.headers.host || '').split(':')[0];
  if (!['127.0.0.1', 'localhost'].includes(host)) { res.writeHead(403); return res.end(); }

  if (url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.headers['x-meu-direct'] !== '1') { res.writeHead(403); return res.end(); }
    let corpo = null;
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      const partes = []; for await (const c of req) partes.push(c);
      try { corpo = JSON.parse(Buffer.concat(partes).toString() || '{}'); } catch { corpo = {}; }
    }
    try {
      const out = await rotear(req, url, corpo);
      res.writeHead(out.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(out.json ?? {}));
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Nao consegui falar com o Zernio: ' + e.message }));
    }
    return;
  }

  // arquivos do painel
  const arquivo = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const caminho = path.join(PASTA, arquivo);
  if (!caminho.startsWith(PASTA) || arquivo.startsWith('.') || !fs.existsSync(caminho) || fs.statSync(caminho).isDirectory()) { res.writeHead(404); return res.end('nao encontrado'); }
  const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
  res.writeHead(200, { 'Content-Type': tipos[path.extname(caminho)] || 'application/octet-stream' });
  fs.createReadStream(caminho).pipe(res);
});

function ouvir(porta, tentativas = 10) {
  servidor.once('error', (e) => {
    if (e.code === 'EADDRINUSE' && tentativas > 0) return ouvir(porta + 1, tentativas - 1);
    console.error('Nao consegui abrir o painel:', e.message); process.exit(1);
  });
  servidor.listen(porta, '127.0.0.1', () => {
    console.log(`\nMeu Direct no ar${DEMO ? ' (MODO DEMONSTRACAO)' : ''}: http://127.0.0.1:${porta}`);
    console.log('Para fechar, aperte Ctrl+C nesta janela.\n');
  });
}
ouvir(PORTA_INICIAL);
