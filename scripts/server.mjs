import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { transit } from '../api/transit.mjs';

const root = resolve(import.meta.dirname, '..');
try { process.loadEnvFile(resolve(root, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const allowedFiles = new Set(['index.html', 'app.js', 'styles.css', 'config.js']);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/api/transit') {
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    const result = await transit(url.searchParams, process.env.KAKAO_REST_API_KEY);
    res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(result.body));
    return;
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!allowedFiles.has(file)) { res.writeHead(404).end(); return; }
  try {
    const data = await readFile(resolve(root, 'dist', file));
    res.writeHead(200, { 'Content-Type': `${types[extname(file)]}; charset=utf-8` }).end(data);
  } catch { res.writeHead(404).end(); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('HachaBell: http://localhost:4173'));
