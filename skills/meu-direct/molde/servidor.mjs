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
import { rotear } from './nucleo.mjs';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
const ARQ_ENV = path.join(PASTA, '.env');
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
      const out = await rotear(req, url, corpo, { config: lerEnv(), salvar: salvarEnv, demo: DEMO, online: false });
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
