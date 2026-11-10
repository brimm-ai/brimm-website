#!/usr/bin/env node
// tools/build-national-day-classy.js — a SECOND OPTION for the UAE National Day page, for the founder to compare (brief 10 Nov 2026:
// "a classy variant of page B: refined hero, smoother section rhythm, light motion that respects reduce-motion, fast on phones").
// It is NOT the page: it is written beside it as /uae-national-day-2026/classy.html, marked noindex, in no sitemap and linked from
// nowhere. If the founder picks it, its look moves into tools/build-national-day.js and this file and classy.html are removed.
// ONE SOURCE OF FACTS: it is made FROM the built page (uae-national-day-2026/index.html — dates, places, links, header, footer and
// asset fingerprints all come from there), so the two options can never disagree about a date or a place. It adds a look and three
// number tiles (9 · 3 · 2, counted from the page's own calendar), nothing else. NO VISA VERDICT IS WRITTEN (the same rule; the
// no-verdicts guard reads this file too).
// MOTION: transforms and opacity only, once, on arrival; everything is visible without JavaScript and with "reduce motion" on.
//   node tools/build-national-day.js && node tools/site-chrome.js && node tools/stamp-assets.js && node tools/build-national-day-classy.js
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..');
const SRC = path.join(SITE, 'uae-national-day-2026', 'index.html'), OUT = path.join(SITE, 'uae-national-day-2026', 'classy.html');
let h = fs.readFileSync(SRC, 'utf8');
const once = (a, b) => { if (h.split(a).length !== 2) throw new Error('expected exactly one: ' + String(a).slice(0, 70)); h = h.replace(a, b); };
const count = (k) => (h.match(new RegExp(`<div class="${k}"><span>`, 'g')) || []).length;
const N = { lv: count('lv'), hol: count('hol'), we: count('we') };
if (N.lv + N.hol + N.we !== 9) throw new Error('the calendar is not 9 days: ' + JSON.stringify(N));
const CSS = `<style>
/* the classy option: a look only (10 Nov 2026) */
.nd2 .hero{height:auto;padding:124px 0 30px;background:#070C16;isolation:isolate}
.nd2 .hero::before{content:'';position:absolute;inset:-20%;z-index:-1;background:
  radial-gradient(38% 46% at 18% 30%,rgba(92,198,198,.38),transparent 70%),
  radial-gradient(42% 50% at 86% 18%,rgba(124,82,248,.40),transparent 72%),
  radial-gradient(26% 30% at 74% 96%,rgba(250,199,117,.16),transparent 70%)}
.nd2 .hero .scrim{background:linear-gradient(180deg,rgba(6,9,18,.25),rgba(6,9,18,0) 40%,#060912 100%)}
.nd2 .hero .in{position:relative;bottom:auto}
.nd2 .crumb{display:inline-flex;align-items:center;gap:10px;font-size:11px;letter-spacing:1.6px;margin-bottom:14px;white-space:nowrap}
.nd2 .crumb::before{content:'';width:28px;height:2px;border-radius:2px;background:var(--grad)}
.nd2 h1{font-size:clamp(30px,6.4vw,54px);line-height:1.08;max-width:20ch;text-wrap:balance}
.nd2 h1 .d{display:none}
.nd2 h1 .q{display:block;margin-top:.28em;font-size:.62em;line-height:1.2;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none}
.nd2 .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:4px 0 22px}
.nd2 .stats div{border-radius:18px;padding:16px 10px 14px;text-align:center;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.1)}
.nd2 .stats b{display:block;font-family:'Noto Serif',serif;font-size:clamp(34px,8vw,46px);line-height:1;letter-spacing:-.02em}
.nd2 .stats div:first-child b{color:#F5C451}
.nd2 .stats span{display:block;margin-top:8px;font-size:12.5px;font-weight:700;color:#C9CFE3;line-height:1.3}
.nd2 .grid{padding-top:26px;gap:26px}
.nd2 .lead{font-size:16px;line-height:1.65;max-width:62ch}
.nd2 .note{display:inline-block;margin:14px 0 6px;padding:8px 12px;border-radius:12px;font-size:12.5px;font-weight:600;color:#F3DDA4;background:rgba(245,196,81,.09);border:1px solid rgba(245,196,81,.28)}
.nd2 .cal{gap:7px;margin:18px 0 12px}
.nd2 .cal div{border-radius:14px;padding:11px 0 10px;border:1px solid rgba(255,255,255,.16);background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03));box-shadow:inset 0 1px 0 rgba(255,255,255,.1)}
.nd2 .cal div b{font-family:'Noto Serif',serif;font-size:21px}
.nd2 .cal .lv{background:linear-gradient(180deg,#F9D67A,#EDB542);border-color:transparent;box-shadow:0 8px 20px rgba(245,196,81,.18),inset 0 1px 0 rgba(255,255,255,.5)}
.nd2 .cal .hol{background:linear-gradient(180deg,#76D7D3,#46B2B6);border-color:transparent;box-shadow:0 8px 20px rgba(92,198,198,.18),inset 0 1px 0 rgba(255,255,255,.45)}
.nd2 .key{font-weight:600;gap:6px 18px}.nd2 .key i{border-radius:50%}
.nd2 h2.pp{margin:46px 0 2px;font-size:25px;letter-spacing:-.01em}
.nd2 h2.pp::before{content:'';display:block;width:44px;height:3px;border-radius:3px;margin-bottom:14px;background:var(--grad)}
.nd2 .pps{margin-bottom:12px}
.nd2 .places{display:grid;gap:10px}
.nd2 .prow{margin:0;padding:14px 14px 14px 18px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);transition:transform .25s ease,border-color .25s ease}
.nd2 .prow b{font-family:'Noto Serif',serif;font-size:18px}
.nd2 .prow a{padding:10px 16px;box-shadow:0 6px 18px rgba(124,82,248,.22)}
.nd2 .tips{margin-top:34px}
.nd2 .panel,.nd2 .tips{border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02)),var(--card)}
@media (hover:hover){.nd2 .prow:hover{transform:translateY(-2px);border-color:rgba(126,200,200,.45)}}
@media (min-width:860px){.nd2 .hero{padding:150px 0 44px}.nd2 .crumb{font-size:12px;letter-spacing:2.4px}.nd2 .places{grid-template-columns:1fr 1fr}.nd2 .stats{max-width:560px}}
@media (prefers-reduced-motion:no-preference){
  @keyframes nd2rise{from{transform:translateY(14px)}to{transform:none}}
  @keyframes nd2in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes nd2glow{from{transform:translate3d(-2%,0,0)}to{transform:translate3d(2%,-2%,0)}}
  .nd2 .hero::before{animation:nd2glow 16s ease-in-out infinite alternate}
  .nd2 .hero .in{animation:nd2rise .6s cubic-bezier(.2,.7,.2,1) both}
  .nd2 .stats div{animation:nd2in .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*70ms + 120ms)}
  .nd2 .cal div{animation:nd2in .45s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*40ms + 260ms)}
  .nd2.io .prow{opacity:0;transform:translateY(12px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.2,1)}
  .nd2.io .prow.in{opacity:1;transform:none}
}
</style>`;
// the place rows arrive softly as they scroll into view; without this script (or with reduce-motion) they are simply there
const JS = `<script>(function(){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var b=document.body;b.classList.add('io');
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});
[].forEach.call(document.querySelectorAll('.prow'),function(r,i){r.style.transitionDelay=(i%2*70)+'ms';o.observe(r)})})()</script>`;
once('<link rel="canonical"', '<meta name="robots" content="noindex">\n<link rel="canonical"');
once('</head>', CSS + '\n</head>');
once('<body>', '<body class="nd2">');
once(' — where can your passport go?</h1>', ' <span class="d">—</span><span class="q">where can your passport go?</span></h1>');
once('<p class="lead">', `<div class="stats"><div style="--i:0"><b>9</b><span>days off</span></div><div style="--i:1"><b>${N.lv}</b><span>days of leave</span></div>`
  + `<div style="--i:2"><b>${N.hol}</b><span>holiday days (expected)</span></div></div>\n    <p class="lead">`);
let i = 0; h = h.replace(/<div class="(we|lv|hol)"><span>/g, (m, k) => `<div class="${k}" style="--i:${i++}"><span>`);
// each group's rows sit in one grid (two columns on a computer)
h = h.replace(/(<p class="pps">[^<]*<\/p>)((?:<div class="prow">.*?<\/a><\/div>)+)/g, '$1<div class="places">$2</div>');
if ((h.match(/<div class="places">/g) || []).length !== (h.match(/<h2 class="pp">/g) || []).length) throw new Error('a group of places was not wrapped');
once('<script src="/assets/stores.js', JS + '\n<script src="/assets/stores.js');
fs.writeFileSync(OUT, h);
console.log(`written ${path.relative(SITE, OUT)} (from the built page; ${N.lv} leave + ${N.hol} holiday + ${N.we} weekend days; noindex)`);
