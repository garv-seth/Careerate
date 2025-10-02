/**
 * Simple smoke tests for v0 endpoints. Run with: npm run smoke
 * Assumes server is running locally at http://localhost:3001
 */
import fetch from 'node-fetch';

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3001';

async function test(path: string, opts: any = {}) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { credentials: 'include', ...opts });
    const ok = res.ok;
    const body = await res.text();
    console.log(`SMOKE ${ok ? '✅' : '❌'} ${opts.method || 'GET'} ${path} -> ${res.status}`);
    if (!ok) console.log(body.slice(0, 400));
    return ok;
  } catch (e: any) {
    console.log(`SMOKE ❌ ${opts.method || 'GET'} ${path} error: ${e.message}`);
    return false;
  }
}

async function run() {
  let passed = true;
  // Readiness (auth required in prod; for local dev, endpoint may allow or be mocked)
  passed &&= await test('/api/hosting/readiness');

  // Catalog
  passed &&= await test('/api/integrations/catalog');

  // Preflight (should 400 without body)
  passed &&= await test('/api/hosting/preflight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });

  // Deploy (expect 202 in local dev if auth bypassed; otherwise at least exercise endpoint)
  passed &&= await test('/api/hosting/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: 'smoke-test', environment: 'production', sourceCode: { 'package.json': '{"name":"smoke","version":"1.0.0","main":"index.js","scripts":{"start":"node index.js"},"dependencies":{"express":"^4.18.0"}}', 'index.js': 'require("express")().get("/",(r,s)=>s.end("ok"))).listen(3000)'} , envVars: {}, port: 3000 }) });

  process.exit(passed ? 0 : 1);
}

run();


