'use strict';

// CI-only origin hosted on 127.0.0.1, never a production restaurant.
// Tests the real Electron renderer's permitted loopback fetch, user-agent
// presentation signal, and the bundled print engine's CORS response.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const resultFile = path.join(process.cwd(), 'renderer-print-smoke-result.json');
try { fs.unlinkSync(resultFile); } catch { /* previous run absent */ }

const page = `<!doctype html><html><meta charset="utf-8"><title>Restora Desktop printing smoke</title>
<script>
(async () => {
  const result = { ua: navigator.userAgent };
  try {
    const response = await fetch('http://127.0.0.1:17777/status');
    result.status = response.status;
    const body = await response.json();
    result.ok = response.ok && typeof body.paired === 'boolean';
  } catch (error) {
    result.error = String(error);
    result.ok = false;
  }
  await fetch('/result', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
})();
</script></html>`;

http.createServer((request, response) => {
  if (request.url === '/result' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 10_000) request.destroy();
    });
    request.on('end', () => {
      fs.writeFileSync(resultFile, body);
      response.writeHead(204).end();
    });
    return;
  }
  if (request.url === '/' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store' }).end(page);
    return;
  }
  response.writeHead(404).end();
}).listen(3000, '127.0.0.1', () => {
  console.log('Renderer printing smoke server listening at http://127.0.0.1:3000');
});
