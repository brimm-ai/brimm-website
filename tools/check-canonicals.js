#!/usr/bin/env node
// tools/check-canonicals.js — EVERY PAGE NAMES ITS OWN ADDRESS, ONCE, AND THE SITEMAP LISTS ONLY THOSE ADDRESSES (10 Nov 2026, HQ #946:
// Search Console reported "Duplicate without user-selected canonical"). What Google flagged was ONE address, http://brimm.ai/, crawled
// on 22 Oct 2026 — before the canonical tags were written (28 Oct) — and still answering 200 because the host does not send http to
// https. The tags were already right on every page; this check keeps them right, so a new page cannot ship without one.
// For every served .html file:
//   - exactly ONE <link rel="canonical">, absolute, https://brimm.ai/..., no query, no fragment;
//   - it is the page's own address: a folder's index.html is the folder (trailing slash); a top-level file is its own name, with or
//     without ".html" (the host serves both; the page picks one);
//   - og:url, when the page has one, is the same address;
//   - a page marked noindex (the 404 page) carries no canonical and is in no sitemap.
// And: every sitemap address is some page's canonical (no redirects, no duplicates), listed once; every indexable page is in the
// sitemap unless it is named in NOT_LISTED with its reason.
//   node tools/check-canonicals.js              check the working tree
//   node tools/check-canonicals.js --self-test  prove it refuses planted cases and passes clean ones
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ORIGIN = 'https://brimm.ai/';
// indexable pages deliberately left out of the sitemap, each with its reason
const NOT_LISTED = {
  'check.html': 'the live visa check: reached from every page, never listed (as built, 1 Nov 2026)',
};
const SKIP_DIRS = new Set(['.git', '.githooks', 'tools', 'node_modules', 'preview']);   // not served (see _config.yml) or not pages

function pages(dir = root, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) out.push(...pages(path.join(dir, e.name), rel + e.name + '/')); }
    else if (e.name.endsWith('.html')) out.push(rel + e.name);
  }
  return out;
}
/** The faults on one page — [] when clean. Returns { bad, canon, noindex }. */
function checkPage(html, rel) {
  const bad = [];
  const canons = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/gi)].map(m => m[1]);
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  const og = (html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i) || [])[1];
  if (noindex) { if (canons.length) bad.push(`${rel}: marked noindex but carries a canonical`); return { bad, canon: null, noindex }; }
  if (canons.length !== 1) { bad.push(`${rel}: ${canons.length} canonical tags (exactly one is needed)`); return { bad, canon: canons[0] || null, noindex }; }
  const c = canons[0];
  const own = ORIGIN + rel.replace(/(^|\/)index\.html$/, '$1');
  const ok = c === own || (!rel.includes('/') && c === own.replace(/\.html$/, ''));
  if (!c.startsWith(ORIGIN) || /[?#]/.test(c)) bad.push(`${rel}: canonical "${c}" is not a plain ${ORIGIN} address`);
  else if (!ok) bad.push(`${rel}: canonical "${c}" is not the page's own address (${own})`);
  if (og !== undefined && og !== c) bad.push(`${rel}: og:url "${og}" differs from the canonical "${c}"`);
  return { bad, canon: c, noindex };
}
function checkSite(list, read, sitemapXml) {
  const bad = [], canon = {};
  for (const rel of list) { const r = checkPage(read(rel), rel); bad.push(...r.bad); if (r.canon && !r.noindex) canon[rel] = r.canon; }
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const all = new Set(Object.values(canon));
  const seen = new Set();
  for (const u of locs) {
    if (seen.has(u)) bad.push(`sitemap.xml: ${u} is listed twice`); seen.add(u);
    if (!all.has(u)) bad.push(`sitemap.xml: ${u} is not any page's canonical address`);
  }
  for (const [rel, c] of Object.entries(canon)) {
    if (NOT_LISTED[rel]) { if (seen.has(c)) bad.push(`sitemap.xml: ${c} is listed, but ${rel} is named NOT_LISTED`); }
    else if (!seen.has(c)) bad.push(`sitemap.xml: ${c} (${rel}) is missing`);
  }
  return { bad, pages: list.length, canonicals: Object.keys(canon).length, locs: locs.length };
}
module.exports = { checkPage, checkSite };

if (require.main === module) {
  if (process.argv.includes('--self-test')) {
    const pg = (c, extra = '') => `<head>${c ? `<link rel="canonical" href="${c}">` : ''}${extra}</head>`;
    const sm = (...u) => u.map(x => `<loc>${x}</loc>`).join('');
    const cases = [   // [name, files, sitemap, should fail]
      ['clean', { 'index.html': pg(ORIGIN), 'a/index.html': pg(ORIGIN + 'a/'), 'terms.html': pg(ORIGIN + 'terms.html'), '404.html': pg('', '<meta name="robots" content="noindex">') }, sm(ORIGIN, ORIGIN + 'a/', ORIGIN + 'terms.html'), false],
      ['clean, extensionless top-level + og:url', { 'index.html': pg(ORIGIN, `<meta property="og:url" content="${ORIGIN}">`), 'about.html': pg(ORIGIN + 'about') }, sm(ORIGIN, ORIGIN + 'about'), false],
      ['no canonical', { 'index.html': pg('') }, '', true],
      ['two canonicals', { 'index.html': pg(ORIGIN) + pg(ORIGIN) }, sm(ORIGIN), true],
      ['http canonical', { 'index.html': pg('http://brimm.ai/') }, sm('http://brimm.ai/'), true],
      ['another page\'s address', { 'index.html': pg(ORIGIN), 'a/index.html': pg(ORIGIN) }, sm(ORIGIN), true],
      ['folder without its slash', { 'index.html': pg(ORIGIN), 'a/index.html': pg(ORIGIN + 'a') }, sm(ORIGIN, ORIGIN + 'a'), true],
      ['query in canonical', { 'index.html': pg(ORIGIN + '?x=1') }, sm(ORIGIN + '?x=1'), true],
      ['og:url differs', { 'index.html': pg(ORIGIN, '<meta property="og:url" content="https://brimm.ai">') }, sm(ORIGIN), true],
      ['sitemap lists a non-canonical', { 'index.html': pg(ORIGIN) }, sm(ORIGIN, ORIGIN + 'index.html'), true],
      ['page missing from sitemap', { 'index.html': pg(ORIGIN), 'a/index.html': pg(ORIGIN + 'a/') }, sm(ORIGIN), true],
      ['sitemap lists a page twice', { 'index.html': pg(ORIGIN) }, sm(ORIGIN, ORIGIN), true],
      ['noindex page with a canonical', { 'index.html': pg(ORIGIN), '404.html': pg(ORIGIN + '404.html', '<meta name="robots" content="noindex">') }, sm(ORIGIN), true],
      ['NOT_LISTED page put in the sitemap', { 'index.html': pg(ORIGIN), 'check.html': pg(ORIGIN + 'check') }, sm(ORIGIN, ORIGIN + 'check'), true],
    ];
    const wrong = cases.filter(([, files, s, fail]) => (checkSite(Object.keys(files), r => files[r], s).bad.length > 0) !== fail).map(c => c[0]);
    if (wrong.length) { console.error('check-canonicals self-test FAILED on:', wrong); process.exit(1); }
    console.log(`check-canonicals self-test: all ${cases.length} cases hold (${cases.filter(c => c[3]).length} planted faults refused, ${cases.filter(c => !c[3]).length} clean sites pass)`);
    process.exit(0);
  }
  const r = checkSite(pages(), rel => fs.readFileSync(path.join(root, rel), 'utf8'), fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'));
  if (r.bad.length) { console.error(`check-canonicals: ${r.bad.length} fault(s):\n  ${r.bad.join('\n  ')}`); process.exit(1); }
  console.log(`check-canonicals: ${r.pages} pages read, ${r.canonicals} carry their own canonical address, ${r.locs} sitemap addresses, all of them canonical`);
}
