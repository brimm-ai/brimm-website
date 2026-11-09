#!/usr/bin/env node
// tools/site-chrome.js — ONE header and ONE footer for every page (founder, 29 Oct 2026 09:35: "give them the new header/footer so the
// site feels like one"). The markup lives here, once, and is written between SITE-HEAD / SITE-FOOT markers on the home, the 20
// itineraries, the 10 visa guides and the 3 legal pages; a page that still has its old nav/footer has it replaced on the first run.
// The page's own content is not touched. The doors that open with a switch (assets/stores.js) are written hidden, as everywhere.
//   node tools/site-chrome.js
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..');
const BRAND = (h) => `<a class="brand" href="/" aria-label="brimm home"><img class="lmark" src="/assets/mark-dark-foreground.svg" alt="" width="${h + 12}" height="${h + 12}"><img class="lword" src="/assets/wordmark-dark.svg" alt="brimm" width="${Math.round(h * 3.45)}" height="${h}"></a>`;
const HEAD = (solid) => `<!-- SITE-HEAD:START (tools/site-chrome.js) -->
<header class="site-head${solid ? ' solid always' : ''}" id="head"><div class="in">
  ${BRAND(22)}
  <nav aria-label="Main"><a class="wide" href="/#how">How it works</a><a href="/#places">Destinations</a><a class="wide" href="/#guides">Visa guides</a><a href="/#pricing">Pricing</a><a class="wide" href="/check.html" data-check-entry hidden>Visa check</a><a class="cta" href="/#get" data-getapp hidden>Get the app</a></nav>
</div></header>${solid ? '\n<div class="head-space" aria-hidden="true"></div>' : ''}
<!-- SITE-HEAD:END -->`;
// the five profiles (founder 7 Nov 2026 15:50, HQ #506; before/after approved on HQ mock #157): white official marks (Simple Icons 13.0.0)
const FOOT = (extra) => `<!-- SITE-FOOT:START (tools/site-chrome.js) -->
<footer class="site-foot">
  <div class="in">
    <div>${BRAND(21)}<p class="foot-tag">What are you brimming today?</p><div class="foot-social"><a href="https://instagram.com/brimm.ai" aria-label="brimm on Instagram" rel="me noopener" target="_blank"><img src="/assets/social/instagram.svg" alt="" width="18" height="18"></a><a href="https://tiktok.com/@brimm.ai" aria-label="brimm on TikTok" rel="me noopener" target="_blank"><img src="/assets/social/tiktok.svg" alt="" width="18" height="18"></a><a href="https://facebook.com/brimmai" aria-label="brimm on Facebook" rel="me noopener" target="_blank"><img src="/assets/social/facebook.svg" alt="" width="18" height="18"></a><a href="https://x.com/brimm_ai" aria-label="brimm on X" rel="me noopener" target="_blank"><img src="/assets/social/x.svg" alt="" width="18" height="18"></a><a href="https://linkedin.com/company/brimm-ai" aria-label="brimm on LinkedIn" rel="me noopener" target="_blank"><img src="/assets/social/linkedin.svg" alt="" width="18" height="18"></a><a href="https://www.youtube.com/@brimm_ai" aria-label="brimm on YouTube" rel="me noopener" target="_blank"><img src="/assets/social/youtube.svg" alt="" width="18" height="18"></a></div></div>
    <div class="cols">
      <div><h4>brimm</h4><ul><li><a href="/#how">How it works</a></li><li><a href="/#places">Destinations</a></li><li><a href="/#pricing">Pricing</a></li></ul></div>
      <div><h4>Visa guides</h4><ul><li><a href="/visa/visa-free-countries-for-uae-residents/">For UAE residents</a></li><li><a href="/visa/georgia-for-uae-residents/">Georgia</a></li><li><a href="/visa/schengen-for-uae-residents/">Schengen</a></li><li><a href="/visa/uk-for-uae-residents/">UK</a></li></ul></div>
      <div><h4>Help</h4><ul><li><a href="mailto:support@brimm.ai">Contact</a></li><li><a href="/privacy.html">Privacy</a></li><li><a href="/terms.html">Terms</a></li><li><a href="/delete-account.html">Delete account</a></li></ul></div>
    </div>
  </div>
  <div class="legal"><span>© 2026 Brimm Limited, UAE</span><span>${extra ? extra + ' · ' : ''}<a href="mailto:support@brimm.ai">support@brimm.ai</a></span></div>
</footer>
<!-- SITE-FOOT:END -->`;
const pages = ['index.html', 'check.html', 'privacy.html', 'terms.html', 'delete-account.html', '404.html']   // check.html since HQ #148 (2 Nov 2026); 404.html since HQ #172 (3 Nov 2026)
  .concat(fs.readdirSync(path.join(SITE, 'itinerary')).map(d => `itinerary/${d}/index.html`))
  // a guide is a folder; /visa/ itself is visa/index.html (the all-guides page, HQ #118, 1 Nov 2026)
  .concat(fs.readdirSync(path.join(SITE, 'visa'), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => `visa/${d.name}/index.html`))
  .concat(fs.existsSync(path.join(SITE, 'visa', 'index.html')) ? ['visa/index.html'] : [])
  // event pages (UAE National Day 2026: tools/build-national-day.js, founder HQ #878, 9 Nov 2026)
  .concat(['uae-national-day-2026/index.html'].filter(f => fs.existsSync(path.join(SITE, f))));
const bad = [];
for (const f of pages) {
  const p = path.join(SITE, f); let h = fs.readFileSync(p, 'utf8');
  const legal = /^(privacy|terms|delete-account|404)\.html$/.test(f);   // no photo at the top: the solid header (the 404 since HQ #172)
  const extra = (h.match(/<footer class="wrap"><span>(Updated [^<]*)<\/span>/) || h.match(/SITE-FOOT:START[\s\S]*?<span>(Updated [^<·]*?) · <a/) || [])[1] || null;
  // the header: between markers if already stamped, else the page's old header block
  if (h.includes('<!-- SITE-HEAD:START')) h = h.replace(/<!-- SITE-HEAD:START[\s\S]*?<!-- SITE-HEAD:END -->/, HEAD(legal));
  else if (/<header class="site-head"[\s\S]*?<\/header>/.test(h)) h = h.replace(/<header class="site-head"[\s\S]*?<\/header>/, HEAD(legal));
  else if (/<nav>[\s\S]*?<\/nav>/.test(h)) h = h.replace(/<nav>[\s\S]*?<\/nav>/, HEAD(legal));
  else bad.push(`${f}: no header to replace`);
  if (h.includes('<!-- SITE-FOOT:START')) h = h.replace(/<!-- SITE-FOOT:START[\s\S]*?<!-- SITE-FOOT:END -->/, FOOT(extra));
  else if (/<footer[\s\S]*?<\/footer>/.test(h)) h = h.replace(/<footer[\s\S]*?<\/footer>/, FOOT(extra));
  else bad.push(`${f}: no footer to replace`);
  if (!h.includes('/assets/site.css')) h = h.replace('</head>', '<link rel="stylesheet" href="/assets/site.css">\n</head>');
  // the title face (site.css) is asked for before the page paints, so a title never draws in a stand-in face and then jumps
  if (!h.includes('NotoSerif-Bold-latin.woff')) h = h.replace('<link rel="stylesheet" href="/assets/site.css">', '<link rel="preload" href="/assets/fonts/NotoSerif-Bold-latin.woff" as="font" type="font/woff" crossorigin>\n<link rel="stylesheet" href="/assets/site.css">');
  if (!h.includes('/assets/stores.js')) h = h.replace('</body>', '<script src="/assets/stores.js"></script>\n</body>');
  if (!h.includes('/assets/site.js')) h = h.replace('</body>', '<script src="/assets/site.js"></script>\n</body>');
  if ((h.match(/SITE-HEAD:START/g) || []).length !== 1 || (h.match(/SITE-FOOT:START/g) || []).length !== 1) bad.push(`${f}: header/footer not exactly once`);
  fs.writeFileSync(p, h);
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log(`${pages.length} pages: one header, one footer, site.css + stores.js + site.js`);
