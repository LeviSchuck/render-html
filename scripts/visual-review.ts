import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { renderHtml } from '../dist/index.js';
import { initBunWasm } from '../dist/bun-wasm.js';
import { readHtml, htmlNodeToHtmlElement } from '@levischuck/tiny-html';
import type { ImageResponseFont } from '../src/types.ts';
import { basicExamples } from '../test/fixtures/basic-examples.ts';
import type { VisualExample } from '../test/fixtures/satori-features.ts';
import { featureExamples } from '../test/fixtures/satori-features.ts';

const out = resolve(process.argv[2] ?? '/tmp/render-html-visual-review');
await mkdir(out, { recursive: true });
const fonts: ImageResponseFont[] = await Promise.all([
  ['Roboto Mono', 'RobotoMono'], ['Sour Gummy', 'SourGummy'],
].map(async ([name, file]) => ({ name: name!, data: await Bun.file(new URL(`../examples/react-demo/public/fonts/${file}-Regular.ttf`, import.meta.url)).arrayBuffer(), weight: 400, style: 'normal' })));
await Promise.all([initBunWasm(), initBunWasm()]);
const results: (VisualExample & { id: number; error: string | null; repeatHash?: string })[] = [];
for (const [index, example] of [...basicExamples, ...featureExamples].entries()) {
  const id = index + 1;
  const { html, width, height, emoji, ...metadata } = example;
  const element = example.element ?? htmlNodeToHtmlElement(readHtml(html).node);
  try {
    for (const format of ['png', 'svg'] as const) {
      await Bun.write(`${out}/${id}.${format}`, await renderHtml(element, { width, height, emoji, fonts, format }));
    }
    const repeats = await Promise.all(Array.from({length: 3}, () => renderHtml(element, {width, height, emoji, fonts})));
    const hashes = await Promise.all(repeats.map(async b => new Bun.CryptoHasher('sha256').update(await b.arrayBuffer()).digest('hex')));
    if (new Set(hashes).size !== 1) throw new Error('Repeated PNG renders differ');
    results.push({ id, ...metadata, html, repeatHash: hashes[0], error: null });
    console.log(`${id}: ${example.name}: PNG + SVG + 3 stable repeats${example.knownIssue ? " (known rendering gap)" : " OK"}`);
  } catch (error) {
    results.push({ id, ...metadata, html, error: String(error) });
    console.error(`${id}: ${example.name}: ${error}`);
  }
}
await Bun.write(`${out}/results.json`, JSON.stringify(results, null, 2));
const escapeHtml = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const pages = Math.ceil(results.length / 2);
const cards = (page: number) => results.slice((page - 1) * 2, page * 2).map(c => `<section><h2>${c.id}. ${escapeHtml(c.name)}</h2><p>${c.since ? `<a href="https://github.com/vercel/satori/releases/tag/${c.since}">Satori ${c.since}</a> · ` : ''}${escapeHtml(c.note)}</p>${c.knownIssue ? `<p class="error"><strong>Known gap:</strong> ${escapeHtml(c.knownIssue)}</p>` : ""}${c.error ? `<pre class="error">${escapeHtml(c.error)}</pre>` : `<div class="pair">${['png','svg'].map(f => `<div class="cell"><b>${f.toUpperCase()}</b><div class="image"><img alt="${escapeHtml(c.name)} ${f}" src="${c.id}.${f}"></div></div>`).join('')}</div>`}<details><summary>${c.element ? "Structured input" : "HTML source"}</summary><pre>${escapeHtml(c.element ? JSON.stringify(c.element,null,2) : c.html)}</pre></details></section>`).join('');
for (let page = 1; page <= pages; page++) {
  const nav = Array.from({length: pages}, (_, n) => `<a ${n+1===page ? 'aria-current="page"' : ''} href="${n===0 ? 'index' : `page-${n+1}`}.html">${n*2+1}–${Math.min(n*2+2,results.length)}</a>`).join(' ');
  await Bun.write(`${out}/${page===1 ? 'index' : `page-${page}`}.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Satori rendering examples ${page}</title><style>body{margin:0;background:#e5e7eb;color:#111827;font:16px system-ui;padding:20px}h1{font-size:24px;margin:0 0 10px}h2{font-size:19px;margin:8px 0}p{margin:4px 0 8px;font-size:13px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.cell{background:#fff;padding:10px;border:1px solid #9ca3af;border-radius:8px}.image{height:250px;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#f1f5f9 0% 25%,white 0% 50%) 50% / 16px 16px}.image img{max-width:100%;max-height:250px;object-fit:contain}section{margin-bottom:12px}nav{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;margin-bottom:12px}a{color:#1d4ed8}a[aria-current]{font-weight:bold;color:#111827}details{font-size:12px;margin-top:4px}pre{white-space:pre-wrap;overflow-wrap:anywhere}.error{color:#991b1b}</style></head><body><h1>Satori 0.32.0 + resvg 2.6.2 — ${results.length} visual examples</h1><nav>${nav}</nav>${cards(page)}</body></html>`);
}
console.log(`Gallery: ${out}/index.html`);
if (results.some(r => r.error && !r.knownIssue)) process.exitCode = 1;
