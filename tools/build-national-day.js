#!/usr/bin/env node
// tools/build-national-day.js — the UAE National Day 2026 page, /uae-national-day-2026/ (founder 9 Nov 2026 23:36, HQ #878: mock #196
// option B, "live visa check per place; build it on a branch, founder OKs before it goes live").
// NO VISA VERDICT IS WRITTEN ON THE PAGE (founder 25 Oct 2026): each place opens the site's own live check (/check.html?to=<city>) for the
// visitor's passport; the doors are written `data-check-entry hidden`, as on every page, so they show only while the check is on.
// The holiday dates are written as EXPECTED: no official announcement yet (9 Nov 2026). The header and footer are tools/site-chrome.js's.
//   node tools/build-national-day.js && node tools/site-chrome.js && node tools/stamp-assets.js
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..');
const OUT = path.join(SITE, 'uae-national-day-2026', 'index.html');
const TITLE = "UAE National Day 2026: 9 days off with 3 days' leave — where can your passport go?";
const DESC = "UAE National Day 2026 is expected on Wednesday 2 and Thursday 3 December. Take 3 days of leave for 9 days off, then check what your passport needs for each place.";
const URL_ = 'https://brimm.ai/uae-national-day-2026/';
// the 9 days: weekday, date, kind (we = weekend, lv = a day of leave, hol = the expected holiday)
const DAYS = [['Sat', 28, 'we'], ['Sun', 29, 'we'], ['Mon', 30, 'lv'], ['Tue', 1, 'lv'], ['Wed', 2, 'hol'], ['Thu', 3, 'hol'], ['Fri', 4, 'lv'], ['Sat', 5, 'we'], ['Sun', 6, 'we']];
// the places, grouped as in the approved mock (the same places as the National Day posts)
const GROUPS = [
  ['Indian passport, living in the UAE', [['Tbilisi', 'Georgia'], ['Yerevan', 'Armenia']]],
  ['Filipino passport, living in the UAE', [['Almaty', 'Kazakhstan'], ['Bali', 'Indonesia'], ['Singapore', 'Singapore'], ['Marrakech', 'Morocco'], ['Tbilisi', 'Georgia']]],
];
// "More from brimm": this site's own itinerary pages for places on this page (only those that exist)
const MORE = [['tbilisi-5-days', 'Tbilisi in 5 days'], ['bali-7-days', 'Bali in 7 days'], ['singapore-3-days', 'Singapore in 3 days']]
  .filter(([slug]) => fs.existsSync(path.join(SITE, 'itinerary', slug, 'index.html')));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const CSS = `<style>
.cal{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:6px;margin:18px 0 10px}
.cal div{border-radius:12px;padding:8px 0;text-align:center;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:#DCE1F0}
.cal div b{display:block;font-size:20px;line-height:1.1}.cal div span{font-size:11px;font-weight:700;opacity:.85}
.cal .lv{background:#F5C451;border-color:#F5C451;color:#0E1530}.cal .hol{background:#5CC6C6;border-color:#5CC6C6;color:#0E1530}
.key{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;font-weight:700;color:#C9CFE3;margin-bottom:6px}.key i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}
h2.pp{font-family:'Noto Serif',serif;font-size:24px;margin:34px 0 4px}.pps{color:#AEB6CF;font-size:14.5px;margin:0 0 14px}
.prow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);margin:8px 0}
.prow b{font-size:16px}.prow small{display:block;color:#AEB6CF;font-size:12.5px;font-weight:500}
.prow a{white-space:nowrap;font-weight:800;font-size:14px;color:#fff;text-decoration:none;padding:8px 14px;border-radius:999px;background:linear-gradient(100deg,#357D7D,#7C52F8)}
.note{margin-top:10px}
</style>`;
const cal = '<div class="cal">' + DAYS.map(([w, d, k]) => `<div class="${k}"><span>${w}</span><b>${d}</b></div>`).join('') + '</div>'
  + '<div class="key"><span><i style="background:#F5C451"></i>3 days of leave</span><span><i style="background:#5CC6C6"></i>2 days of holiday (expected)</span>'
  + '<span><i style="border:1.5px solid rgba(255,255,255,.3)"></i>4 weekend days</span></div>';
const groups = GROUPS.map(([h, places]) => `<h2 class="pp">${esc(h)}</h2><p class="pps">Ideas for 9 days:</p>`
  + places.map(([c, ctry]) => `<div class="prow"><div><b>${esc(c)}</b><small>${esc(ctry)}</small></div>`
    + `<a href="/check.html?to=${encodeURIComponent(c)}" data-check-entry hidden>Check for your passport ✈️</a></div>`).join('')).join('');
const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: TITLE, description: DESC, url: URL_, inLanguage: 'en',
  publisher: { '@type': 'Organization', name: 'Brimm Limited', url: 'https://brimm.ai/' } };
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(TITLE)} | brimm</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${URL_}">
<meta property="og:title" content="${esc(TITLE)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${URL_}">
<meta property="og:image" content="https://brimm.ai/assets/og-image.png">
<meta name="theme-color" content="#060912">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="preload" href="/assets/fonts/Manrope-Bold-latin.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/seo.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="preload" href="/assets/fonts/NotoSerif-Bold-latin.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
${CSS}
</head>
<body>
<!-- SITE-HEAD:START (tools/site-chrome.js) -->
<!-- SITE-HEAD:END -->
<header class="hero" style="--g0:#2c6f78;--g1:#141B36">
  <div class="scrim"></div>
  <div class="in wrap"><p class="crumb">LONG WEEKEND · UAE NATIONAL DAY 2026</p><h1>${esc(TITLE)}</h1></div>
</header>
<main class="wrap grid">
  <article>
    <p class="lead">The UAE National Day holiday is expected on Wednesday 2 and Thursday 3 December 2026. Take three days of leave, Monday 30 November, Tuesday 1 and Friday 4 December, and you are off for nine days: Saturday 28 November to Sunday 6 December.</p>
    <p class="note">⚠️ Expected dates: the official announcement has not been made yet.</p>
    ${cal}
    ${groups}
    <section class="tips"><p class="dayhead">GOOD TO KNOW</p><ul><li>Rules change. Always check the official site before you book.</li></ul></section>
  </article>
  <aside>
    <section class="panel visa" data-check-entry hidden><p class="ph">🛂 Check your passport</p><p class="pl">Your passport, where you live and the visas you hold all change the answer.</p>
      <a class="go out" href="/check.html"><span class="nw">brimm-it!</span> ✈️</a></section>
    <section class="panel app" id="app"><p class="ph">✨ Make it yours in the brimm app</p><p class="pl">Your dates, your pace, your budget. Add what you love; brimm fits it in.</p>
      <div class="app-badges" data-app><span class="badge pending"><img class="gp" src="/assets/badges/google-play.png" alt="Google Play" width="167" height="65"><span class="soon-tag">Coming soon</span></span><span class="badge pending"><img src="/assets/badges/app-store.svg" alt="App Store" width="132" height="44"><span class="soon-tag">Coming soon</span></span></div>
      <p class="qr" data-app-qr hidden><img src="/assets/play-qr.svg" alt="QR code for brimm on Google Play" width="112" height="112"><span>On your phone? Scan to get brimm.</span></p></section>
    ${MORE.length ? `<section class="panel more"><p class="ph">More from brimm</p>${MORE.map(([s, t]) => `<a href="/itinerary/${s}/">${esc(t)} →</a>`).join('')}</section>` : ''}
  </aside>
</main>
<!-- SITE-FOOT:START (tools/site-chrome.js) -->
<!-- SITE-FOOT:END -->
<script src="/assets/stores.js"></script>
<script src="/assets/app-button.js"></script>
<script src="/assets/site.js"></script>
</body>
</html>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`written ${path.relative(SITE, OUT)} (${GROUPS.reduce((n, g) => n + g[1].length, 0)} places, ${MORE.length} more-links)`);
