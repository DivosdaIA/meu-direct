// Meu Direct: versao online (Vercel), com login por pessoa da equipe.
// Tudo que e segredo fica nas variaveis de ambiente do projeto na Vercel:
//   ZERNIO_API_KEY      a chave do Zernio (nunca vai para o navegador)
//   ZERNIO_ACCOUNT_ID   conta que abre por padrao (e ZERNIO_PROFILE_ID, ZERNIO_USERNAME)
//   PAINEL_USUARIOS     uma pessoa por item: "ana:senha-da-ana;bruno:senha-do-bruno"
//   PAINEL_SEGREDO      texto aleatorio longo que assina o login (nao e senha de ninguem)
// Sem banco de dados. Para tirar alguem: apague a pessoa de PAINEL_USUARIOS e publique de novo.

import crypto from 'node:crypto';
import { rotear } from '../nucleo.mjs';

const DIAS = 7;
// limite de tentativas: 5 erros em 15 minutos bloqueiam aquele usuario e aquele endereco por 15 minutos.
// Vale enquanto a funcao esta ativa na Vercel (nao ha banco); a protecao principal sao as senhas fortes.
const TENTATIVAS = new Map();
const JANELA = 15 * 60 * 1000, MAX_ERROS = 5;
function bloqueado(chave) { const x = TENTATIVAS.get(chave); return !!x && x.n >= MAX_ERROS && Date.now() - x.ini < JANELA; }
function errou(chave) { const x = TENTATIVAS.get(chave); if (!x || Date.now() - x.ini > JANELA) TENTATIVAS.set(chave, { n: 1, ini: Date.now() }); else x.n++; }
const segredo = () => process.env.PAINEL_SEGREDO || '';

function usuarios() {
  const mapa = new Map();
  for (const item of (process.env.PAINEL_USUARIOS || '').split(';')) {
    const i = item.indexOf(':');
    if (i > 0) mapa.set(item.slice(0, i).trim().toLowerCase(), item.slice(i + 1).trim());
  }
  return mapa;
}
const igual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
const marcaDaSenha = (senha) => crypto.createHmac('sha256', segredo()).update('senha|' + senha).digest('base64url').slice(0, 16);
const assinar = (txt) => crypto.createHmac('sha256', segredo()).update(txt).digest('base64url');
function lerCookies(req) {
  const out = {};
  for (const p of (req.headers.cookie || '').split(';')) { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }
  return out;
}
function sessao(req) {
  const c = lerCookies(req).md_sessao; if (!c) return null;
  const [dados, ass] = c.split('.');
  if (!dados || !ass || !igual(ass, assinar(dados))) return null;
  const [usuario, exp, marca] = Buffer.from(dados, 'base64url').toString().split('|');
  const senha = usuarios().get(usuario);
  // pessoa removida ou senha trocada: a sessao antiga deixa de valer na hora
  if (!senha || !marca || !igual(marca, marcaDaSenha(senha)) || Date.now() > Number(exp)) return null;
  return usuario;
}
const cookie = (nome, valor, maxAge) => `${nome}=${encodeURIComponent(valor)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
function responder(res, status, json, cookies = []) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.end(JSON.stringify(json ?? {}));
}
async function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const partes = []; for await (const c of req) partes.push(c);
  try { return JSON.parse(Buffer.concat(partes).toString() || '{}'); } catch { return {}; }
}

export default async function handler(req, res) {
  let url = new URL(req.url, 'https://painel.local');
  // a Vercel pode entregar o endereco reescrito (/api/painel?__rota=...): volta para o original
  const rota = url.searchParams.get('__rota');
  if (url.pathname === '/api/painel' && rota !== null) url = new URL('/api/' + rota.replace(/^\/+/, ''), 'https://painel.local');
  // falha fechada: sem usuarios ou sem segredo, ninguem entra
  if (!usuarios().size || segredo().length < 32 || !process.env.ZERNIO_API_KEY) return responder(res, 500, { error: 'Painel online sem configuracao completa. Peca ao Claude: /meu-direct conferir o painel online.' });
  if (req.method !== 'GET' && req.headers['x-meu-direct'] !== '1') return responder(res, 403, { error: 'Bloqueado.' });

  const corpo = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await lerCorpo(req) : null;

  if (url.pathname === '/api/entrar' && req.method === 'POST') {
    const usuario = String(corpo?.usuario || '').trim().toLowerCase();
    const senha = String(corpo?.senha || '');
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    if (bloqueado('u:' + usuario) || bloqueado('ip:' + ip)) return responder(res, 429, { error: 'Muitas tentativas erradas. Espere 15 minutos e tente de novo.', precisaLogin: true });
    const certa = usuarios().get(usuario);
    if (!certa || !igual(senha, certa)) { errou('u:' + usuario); errou('ip:' + ip); await new Promise((r) => setTimeout(r, 800)); return responder(res, 401, { error: 'Usuario ou senha errados.', precisaLogin: true }); }
    TENTATIVAS.delete('u:' + usuario);
    const dados = Buffer.from(`${usuario}|${Date.now() + DIAS * 864e5}|${marcaDaSenha(certa)}`).toString('base64url');
    return responder(res, 200, { ok: true, usuario }, [cookie('md_sessao', `${dados}.${assinar(dados)}`, DIAS * 86400)]);
  }
  if (url.pathname === '/api/sair' && req.method === 'POST') return responder(res, 200, { ok: true }, [cookie('md_sessao', '', 0), cookie('md_conta', '', 0)]);

  const usuario = sessao(req);
  if (!usuario) return responder(res, 401, { error: 'Entre com o seu usuario e senha.', precisaLogin: true });

  // conta ativa: cada pessoa da equipe escolhe a sua (fica num cookie), o padrao vem da Vercel
  let conta = {};
  try { conta = JSON.parse(Buffer.from(lerCookies(req).md_conta || '', 'base64url').toString() || '{}'); } catch {}
  const ok = (v) => typeof v === 'string' && /^[\w.-]{1,80}$/.test(v);
  const config = {
    ZERNIO_API_KEY: process.env.ZERNIO_API_KEY,
    ZERNIO_ACCOUNT_ID: ok(conta.id) ? conta.id : process.env.ZERNIO_ACCOUNT_ID,
    ZERNIO_PROFILE_ID: ok(conta.id) ? (ok(conta.profileId) ? conta.profileId : '') : process.env.ZERNIO_PROFILE_ID,
    ZERNIO_USERNAME: ok(conta.id) ? (ok(conta.username) ? conta.username : '') : process.env.ZERNIO_USERNAME,
  };
  const cookiesNovos = [];
  const salvar = (novos) => {
    if ('ZERNIO_ACCOUNT_ID' in novos) cookiesNovos.push(cookie('md_conta', Buffer.from(JSON.stringify({ id: novos.ZERNIO_ACCOUNT_ID, profileId: novos.ZERNIO_PROFILE_ID, username: novos.ZERNIO_USERNAME })).toString('base64url'), 365 * 86400));
  };
  try {
    const out = await rotear(req, url, corpo, { config, salvar, demo: false, online: true, usuario });
    return responder(res, out.status, out.json, cookiesNovos);
  } catch (e) {
    return responder(res, 502, { error: 'Nao consegui falar com o Zernio: ' + e.message });
  }
}
