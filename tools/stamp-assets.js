#!/usr/bin/env node
// tools/stamp-assets.js — EVERY FILE A PAGE LOADS CARRIES ITS OWN FINGERPRINT (founder, 1 Nov 2026, HQ #94: after a publish the founder's
// phone kept showing the OLD home-paris.webp under the same file name while the laptop showed the new one — GitHub Pages lets a browser
// keep a file 10 minutes (max-age=600) and a phone may hold it longer). So every "/assets/<file>" a page, stylesheet or script points at
// becomes "/assets/<file>?v=<first 8 hex of the file's sha256>": a changed file gets a new address no cache has seen, an unchanged file
// keeps its address and stays cached. GitHub Pages ignores the query; only the browser's cache key changes.
//   node tools/stamp-assets.js            stamp the working tree (idempotent: a second run changes nothing)
//   node tools/stamp-assets.js --check    exit 1, naming each file, if anything is not stamped or carries a stale fingerprint (the hook)
//   node tools/stamp-assets.js --self-test  prove the rewrite and the check on planted cases (the control)
// ONE STEP AT THE END, NOT IN EVERY WRITER: the pages are written by several tools (tools/build-home.js, tools/site-chrome.js, brimm-ai's
// tools/seo-pages and tools/visa-pages), and each may write a plain "/assets/x.png". This runs after them; .githooks/pre-commit runs
// --check, so an unstamped or stale address cannot be committed whoever wrote it.
// ADDRESSES A PAGE BUILDS WHILE IT RUNS (the home's hero slideshow, the check page's photo) cannot be rewritten as text: those pages hold an
// /* ASSET-V:START */ block this tool writes — AV, the fingerprints of assets/hero and assets/app, and av(url), which adds the right ?v —
// and their code asks av() for every address it builds.
// ⚠️ LEFT ALONE ON PURPOSE: assets/check-engine.js — check.html already asks for it by its own fingerprint (ENGINE_V, written by brimm-ai's
// tools/website-check/build-engine.js); a second ?v would break that address. The pages themselves ("/", "/itinerary/x/") cannot carry a
// fingerprint in their own address; they are revalidated after GitHub's 10 minutes.
// ⚠️ WHAT --check CANNOT SEE: an address a script builds WITHOUT going through av() (e.g. a new '/assets/hero/' + name) — no text pattern
// finds a built string reliably. Such code must call av(); this is convention, stated here.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');

const EXT = 'png|jpe?g|webp|svg|gif|ico|css|js|json|woff2?|ttf|otf|mp4|webm';
const REF = new RegExp(`/assets/([A-Za-z0-9_\\-./]+?\\.(?:${EXT}))(\\?v=[0-9a-f]{8})?(?![A-Za-z0-9_\\-./])`, 'g');
const SKIP_ASSET = new Set(['check-engine.js']);                  // carries its own fingerprint (ENGINE_V)
const SKIP_FILE = f => f.startsWith('tools/') || f.startsWith('.githooks/') || f === 'assets/check-engine.js';
const DYNAMIC = /^(hero|app)\//;                                   // the directories pages build addresses into while they run
const AV_BLOCK = /\/\* ASSET-V:START[^*]*\*\/[\s\S]*?\/\* ASSET-V:END \*\//;

const hash = buf => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);

/** Rewrite every /assets/<file> address in `text` to carry its fingerprint; unknown files and skipped ones are left exactly as they are. */
function stampText(text, hashes) {
  return text.replace(REF, (m, rel) => (SKIP_ASSET.has(rel) || !hashes[rel]) ? m : `/assets/${rel}?v=${hashes[rel]}`);
}
/** The AV block for a page that builds addresses while it runs: fingerprints of the dynamic directories, and av(). Keys carry no "/assets/"
 *  so the block itself never matches REF. */
function avBlock(hashes) {
  const map = {}; Object.keys(hashes).filter(k => DYNAMIC.test(k)).sort().forEach(k => { map[k] = hashes[k]; });
  return '/* ASSET-V:START (written by tools/stamp-assets.js) */\n  var AV = ' + JSON.stringify(map) +
    ';\n  function av(u) { var k = u.replace(/^\\/assets\\//, \'\'); return AV[k] ? u + \'?v=\' + AV[k] : u; }\n  /* ASSET-V:END */';
}
/** The whole site's expected text, file by file. Stylesheets and scripts are stamped first and re-hashed until nothing moves (a CSS
 *  file's own fingerprint depends on the fonts it names), then the pages. */
function plan(read, list, readBin) {
  const assets = list.filter(f => f.startsWith('assets/'));
  const hashes = {}; for (const f of assets) hashes[f.slice(7)] = hash(readBin(f));
  const text = list.filter(f => /\.(html?|css|js|json|xml|webmanifest)$/i.test(f) && !SKIP_FILE(f));
  const out = {};
  for (let pass = 0; pass < 5; pass++) {
    let moved = false;
    for (const f of text.filter(f => f.startsWith('assets/'))) {
      const next = stampText(out[f] ?? read(f), hashes); out[f] = next;
      const h = hash(Buffer.from(next, 'utf8')); if (hashes[f.slice(7)] !== h) { hashes[f.slice(7)] = h; moved = true; }
    }
    if (!moved) break;
  }
  for (const f of text.filter(f => !f.startsWith('assets/'))) {
    let t = stampText(read(f), hashes);
    if (AV_BLOCK.test(t)) t = t.replace(AV_BLOCK, avBlock(hashes));
    out[f] = t;
  }
  return out;
}

if (process.argv.includes('--self-test')) {
  const files = {
    'assets/hero/paris-960.jpg': 'PARIS-NEW', 'assets/app/home-paris.webp': 'HOME-NEW', 'assets/fonts/a.ttf': 'FONT',
    'assets/site.css': "@font-face{src:url('/assets/fonts/a.ttf')}", 'assets/check-engine.js': 'engine',
    'index.html': '<img src="/assets/hero/paris-960.jpg" srcset="/assets/hero/paris-960.jpg 960w, /assets/missing.jpg 1920w">' +
      '<link href="/assets/site.css"><script>/* ASSET-V:START */ old /* ASSET-V:END */ var u = av(\'/assets/app/\' + n);</script>' +
      '<script>sc.src = \'/assets/check-engine.js?v=\' + ENGINE_V;</script><img src="/assets/app/home-paris.webp?v=00000000">',
  };
  const read = f => files[f], bin = f => Buffer.from(files[f]), list = Object.keys(files);
  const out = plan(read, list, bin), html = out['index.html'];
  const h = s => hash(Buffer.from(s));
  const css = out['assets/site.css'];
  const checks = [
    ['an unstamped image gets its fingerprint', html.includes(`/assets/hero/paris-960.jpg?v=${h('PARIS-NEW')}"`)],
    ['both addresses in a srcset are stamped (the known one)', html.includes(`/assets/hero/paris-960.jpg?v=${h('PARIS-NEW')} 960w`)],
    ['a file that does not exist is left as it is', html.includes('/assets/missing.jpg 1920w')],
    ['a STALE fingerprint is replaced', html.includes(`home-paris.webp?v=${h('HOME-NEW')}`) && !html.includes('?v=00000000')],
    ['a stylesheet names its font by fingerprint', css.includes(`/assets/fonts/a.ttf?v=${h('FONT')}`)],
    ['the page names the STAMPED stylesheet', html.includes(`/assets/site.css?v=${h(css)}`)],
    ['check-engine.js keeps its own ENGINE_V address', html.includes("'/assets/check-engine.js?v=' + ENGINE_V")],
    ['the AV block is rewritten with the dynamic files', html.includes(`"app/home-paris.webp":"${h('HOME-NEW')}"`) && html.includes(`"hero/paris-960.jpg":"${h('PARIS-NEW')}"`) && !html.includes(' old ')],
    ['the AV block does not list a non-dynamic file', !/"fonts\/a\.ttf"/.test(html)],
    ['a second run changes nothing (idempotent)', (() => { const again = plan(f => out[f] ?? files[f], list, bin); return Object.keys(out).every(f => again[f] === out[f]); })()],
  ];
  const bad = checks.filter(c => !c[1]);
  if (bad.length) { console.error('stamp-assets self-test FAILED:\n  ' + bad.map(c => c[0]).join('\n  ')); process.exit(1); }
  console.log(`stamp-assets self-test: all ${checks.length} cases hold (stamp, srcset, missing file, stale fingerprint, CSS order, ENGINE_V, AV block, idempotent)`);
  process.exit(0);
}

const list = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
  .concat(execSync('git ls-files --others --exclude-standard', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean))
  .filter(f => fs.existsSync(path.join(root, f)));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const out = plan(read, list, f => fs.readFileSync(path.join(root, f)));
const changed = Object.keys(out).filter(f => out[f] !== read(f));
if (process.argv.includes('--check')) {
  if (changed.length) { console.error(`stamp-assets: ${changed.length} file(s) not stamped or carrying a stale fingerprint — run node tools/stamp-assets.js:\n  ${changed.join('\n  ')}`); process.exit(1); }
  console.log(`stamp-assets: ${Object.keys(out).length} files read, every /assets address carries its current fingerprint`);
  process.exit(0);
}
for (const f of changed) fs.writeFileSync(path.join(root, f), out[f]);
console.log(`stamp-assets: ${changed.length} file(s) stamped${changed.length ? ':\n  ' + changed.join('\n  ') : ''}`);
